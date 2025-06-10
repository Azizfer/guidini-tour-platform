// Frontend service for Groups API

export interface Group {
  _id: string;
  name: string;
  members: string[];
  invites: Array<{ userId: string; status: 'pending' | 'accepted' | 'rejected'; invitedAt: string }>;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api') + '/groups';

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const groupService = {
  createGroup: async (name: string): Promise<Group> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Error creating group');
    return res.json();
  },

  inviteUser: async (groupId: string, userId: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/${groupId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify({ userId }),
    });
    return res.ok;
  },

  respondInvite: async (groupId: string, accept: boolean): Promise<boolean> => {
    const res = await fetch(`${API_URL}/${groupId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify({ accept }),
    });
    return res.ok;
  },

  getMyGroups: async (): Promise<Group[]> => {
    const res = await fetch(`${API_URL}/my`, {
      headers: {
        ...authHeader(),
      },
    });
    if (!res.ok) throw new Error('Error fetching groups');
    return res.json();
  },
};

export default groupService;
