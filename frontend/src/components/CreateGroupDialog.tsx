"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import groupService from "@/services/groupService";
import userService, { User } from "@/services/userService";
import { toast } from "@/components/ui/use-toast";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  type Invite = Partial<User> & { _id?: string; id?: string };
  const [invites, setInvites] = useState<Invite[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const addInvite = (user: Invite) => {
    setInvites((prev) => {
      if (prev.some((u) => (u._id || u.id) === (user._id || user.id))) return prev;
      return [...prev, user];
    });
    setInviteInput("");
    setSearchResults([]);
  };

  const removeInvite = (id: string) => {
    setInvites((prev) => prev.filter((u) => (u._id || u.id) !== id));
  };

  useEffect(() => {
    const q = inviteInput.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const results = await userService.searchUsers(q);
      const filtered = results.filter(
        (u) => !invites.some((inv) => (inv._id || inv.id) === (u._id || u.id))
      );
      setSearchResults(filtered);
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [inviteInput, invites]);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Nom du groupe requis",
        description: "Veuillez entrer un nom de groupe.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const group = await groupService.createGroup(groupName.trim());

      for (const invite of invites) {
        const userId = invite._id || invite.id;
        if (!userId) continue;
        try {
          await groupService.inviteUser(group._id, userId);
        } catch (err) {
          console.error("Invitation échouée pour", userId, err);
        }
      }

      toast({
        title: "Groupe créé",
        description:
          `Le groupe « ${groupName} » a été créé avec succès` +
          (invites.length ? ` et ${invites.length} invitation(s) envoyée(s).` : "."),
      });

      setGroupName("");
      setInvites([]);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un groupe</DialogTitle>
          <DialogDescription>
            Choisissez un nom et invitez des utilisateurs (ID ou email).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm text-gray-700">Nom du groupe</label>
            <Input
              placeholder="Nom du groupe"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Inviter des utilisateurs</label>
            <div className="relative mt-1">
              <Input
                placeholder="Recherche par nom ou email…"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
              />
              {searchLoading && (
                <span className="absolute right-3 top-2 text-gray-400 text-sm">…</span>
              )}
              {searchResults.length > 0 && (
                <ul className="absolute z-50 bg-white border border-gray-200 rounded shadow w-full mt-1 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <li
                      key={user._id || user.id}
                      onClick={() => addInvite(user)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex flex-col"
                    >
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {invites.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {invites.map((u) => {
                  const label = u.name || u.email || u.id || u._id || "Utilisateur";
                  const uid = u._id || u.id || label;
                  return (
                    <span
                      key={uid}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                    >
                      {label}
                      <button
                        onClick={() => removeInvite(uid)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Création…" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
