const Group = require('../models/Group');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Helper to emit socket event
const emitNotificationUpdate = (io, userId) => {
  if (io) {
    io.emit('notificationUpdate', { userId: userId.toString() });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });

    const group = await Group.create({
      name: name.trim(),
      creatorId: req.user.id,
      members: [req.user.id],
    });

    return res.status(201).json(group);
  } catch (err) {
    console.error('Error creating group:', err);
    return res.status(500).json({ error: 'Erreur de création du groupe' });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const { userId } = req.body; // invitee id

    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Only creator or member can invite
    if (!group.creatorId.equals(req.user.id) && !group.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to invite users to this group' });
    }

    const existingInvite = group.invites.find(i => i.userId.equals(userId));
    if (!existingInvite) {
      group.invites.push({ userId });
      await group.save();
    } else if (existingInvite.status === 'rejected') {
      // Re-invite rejected user
      existingInvite.status = 'pending';
      existingInvite.invitedAt = new Date();
      await group.save();
    } else {
      return res.status(400).json({ error: 'User already invited' });
    }

    // Create notification for invitee
    await Notification.create({
      recipient: userId,
      type: 'group_invite',
      title: 'Invitation de groupe',
      description: `${req.user.name || 'Un utilisateur'} vous a invité dans le groupe "${group.name}"`,
      read: false,
      avatar: req.user.avatar || '',
      userId: req.user.id, // inviter id for frontend usage
    });

    emitNotificationUpdate(req.app.get('io'), userId);

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error inviting user:', err);
    return res.status(500).json({ error: 'Erreur lors de l\'invitation' });
  }
};

exports.respondInvite = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const { accept } = req.body; // true / false
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const invite = group.invites.find(i => i.userId.equals(userId));
    if (!invite) return res.status(400).json({ error: 'No invite found' });

    invite.status = accept ? 'accepted' : 'rejected';
    if (accept && !group.members.includes(userId)) {
      group.members.push(userId);
    }
    await group.save();

    // If the invite was accepted, create or update a conversation with the group creator
    if (accept) {
      try {
        let conversation = await Conversation.findOne({
          participants: { $all: [group.creatorId, userId] },
        });

        if (!conversation) {
          conversation = new Conversation({ participants: [group.creatorId, userId] });
          await conversation.save();
        }

        const joinContent = `${req.user.name || 'Un utilisateur'} a rejoint le groupe "${group.name}"`;

        const message = new Message({
          conversation: conversation._id,
          sender: userId,
          content: joinContent,
          readBy: [userId],
        });
        await message.save();

        conversation.lastMessage = message._id;
        conversation.updatedAt = Date.now();
        await conversation.save();

        // Emit socket event so frontend can refresh messages if using websockets
        emitNotificationUpdate(req.app.get('io'), group.creatorId);
        emitNotificationUpdate(req.app.get('io'), userId);
      } catch (msgErr) {
        console.error('Error creating system message after invite acceptance:', msgErr);
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error responding to invite:', err);
    return res.status(500).json({ error: 'Erreur de réponse à l\'invitation' });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      $or: [
        { creatorId: userId },
        { members: userId },
        { 'invites.userId': userId },
      ],
    });

    return res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des groupes' });
  }
};
