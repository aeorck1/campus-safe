'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Trash, UserPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TabsContent } from '@/components/ui/tabs';

function InvestigatingTeamTabContent() {
  const { toast } = useToast();
  const getInvestigatingTeam = useAuthStore((state) => state.getInvestigatingTeam);
  const getInvestigatingTeamMembers= useAuthStore((state) => state.getInvestigatingTeamMembers)
  const postInvestigatingTeam = useAuthStore((state) => state.postInvestigatingTeam);
  const createInvestigatingTeam = useAuthStore((state) => state.createInvestigatingTeam);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<{ name: string; id: string; team: string }>({ name: '', id: '', team: '' });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const user= useAuthStore((state) => state.user);
  // Fetch all teams for dropdown
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await getInvestigatingTeam();
        if (res && res.success && Array.isArray(res.data)) {
          // If your backend has a separate endpoint for teams, use it. Here, we assume each member has a team property.
          // const teams = Array.from(new Set(res.data.map((m: any) => m.team))).filter(Boolean);
          // setAllTeams(res.map((name: string, idx: number) => ({ id: String(idx), name })));
          
        }
        console.log("Here is data", res.data)
      } catch {}
    }
    fetchTeams();
  }, [getInvestigatingTeam]);

  // Fetch all users who are not students
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await useAuthStore.getState().adminGetAllUsers();
        if (res && res.success && Array.isArray(res.data)) {
          setAllUsers(res.data.filter((u: any) => u.role !== 'STUDENT'));
        }
      } catch {}
    }
    fetchUsers();
  }, []);

  // Fetch team from backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    getInvestigatingTeam()
      .then((res: any) => {
        if (res && res.success && Array.isArray(res.data)) {
          setTeam(res.data);
        } else {
          setTeam([]);
          setError(res?.message || 'Failed to fetch team.');
        }
      })
      .catch(() => setError('Failed to fetch team.'))
      .finally(() => setLoading(false));
  }, [getInvestigatingTeam]);

  // Add member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.team.trim() || !newMember.id) return;
    setCreating(true);
    setError(null);
    try {
      // Send { id, team, member } to backend
      const payload = { id: newMember.id, team: newMember.team, member: newMember.name };
      const res = await postInvestigatingTeam(payload);
      if (res && res.success) {
        toast({ title: 'Member Added', description: `${newMember.name} added to ${newMember.team}.`, variant: 'success' });
        // Refresh team
        const teamRes = await getInvestigatingTeamMembers();
        if (teamRes && teamRes.success && Array.isArray(teamRes.data)) setTeam(teamRes.data);
        setNewMember({ name: '', id: '', team: '' });
      } else {
        setError(res?.message || 'Failed to add member.');
        toast({ title: 'Error', description: res?.message || 'Failed to add member.', variant: 'destructive' });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add member.');
      toast({ title: 'Error', description: err?.message || 'Failed to add member.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  // Create Investigation Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.id.trim() || !newTeam.name.trim()) return;
    setCreatingTeam(true);
    setError(null);
    try {
      // Use the user from state (already fetched at the top)
      if (!user || !user.username) {
        setError('User information is missing.');
        setCreatingTeam(false);
        return;
      }
      const payload = { id: newTeam.id, name: newTeam.name, created_by_user: user.username };
      const res = await createInvestigatingTeam(payload);
      if (res && res.success) {
        toast({ title: 'Team Created', description: `Team '${newTeam.name}' created.`, variant: 'success' });
        setNewTeam({ id: '', name: '' });
      } else {
        setError(res?.message || 'Failed to create team.');
        toast({ title: 'Error', description: res?.message || 'Failed to create team.', variant: 'destructive' });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create team.');
      toast({ title: 'Error', description: err?.message || 'Failed to create team.', variant: 'destructive' });
    } finally {
      setCreatingTeam(false);
    }
  };

  // Remove member (assume postInvestigatingTeam with a delete action or similar, or just filter locally for now)
  const handleDeleteMember = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      // If you have a delete endpoint, use it here. For now, just filter locally:
      // await deleteInvestigatingTeam(id)
      setTeam((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Failed to remove member.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <TabsContent value="investigating-team" className="flex flex-col flex-1 h-full min-h-[70vh] w-full p-0 m-0">
      <Card className="flex flex-col flex-1 h-full w-full m-0">
        <CardHeader className="pb-2 w-full">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Investigating Team
          </CardTitle>
          <CardDescription>Manage the list of team members responsible for incident investigation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 w-full">
          {/* Create Investigation Team Box */}
          <form onSubmit={handleCreateTeam} className="flex flex-col md:flex-row gap-2 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm w-full">
            <Input
              type="text"
              placeholder="Team ID (e.g. TEAM1)"
              value={newTeam.id}
              onChange={e => setNewTeam({ ...newTeam, id: e.target.value })}
              disabled={creatingTeam}
              required
              className="md:w-1/4"
            />
            <Input
              type="text"
              placeholder="Team Name (e.g. Main Investigation Team)"
              value={newTeam.name}
              onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
              disabled={creatingTeam}
              required
              className="md:w-1/2"
            />
            <Button type="submit" disabled={creatingTeam || !newTeam.id.trim() || !newTeam.name.trim()} className="flex gap-2">
              <UserPlus className="w-4 h-4" />
              {creatingTeam ? 'Creating...' : 'Create Team'}
            </Button>
          </form>

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-2 mb-6 items-center bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full">
            {/* Team Combobox */}
            <div className="w-full md:w-1/4">
              <Combobox
                options={allTeams.map((t) => ({ value: t.id, label: t.name }))}
                value={newMember.team}
                onChange={val => setNewMember((prev) => ({ ...prev, team: val }))}
                placeholder="Select Team"
                disabled={creating}
                className="w-full"
                required
              />
            </div>
            {/* User Combobox */}
            <div className="w-full md:w-1/2">
              <Combobox
                options={allUsers.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name} (${u.username})` }))}
                value={newMember.id}
                onChange={val => {
                  const user = allUsers.find((u) => u.id === val);
                  setNewMember((prev) => ({
                    ...prev,
                    id: val,
                    name: user ? `${user.first_name} ${user.last_name}` : '',
                  }));
                }}
                placeholder="Select User"
                disabled={creating}
                required
              />
            </div>
            <Button type="submit" disabled={creating || !newMember.name.trim() || !newMember.team.trim() || !newMember.id} className="flex gap-2 h-10">
              <UserPlus className="w-4 h-4" />
              {creating ? 'Adding...' : 'Add Member'}
            </Button>
          </form>
          {error && <div className="text-destructive mb-2">{error}</div>}
          <div className="flex-1 w-full overflow-auto">
            {loading ? (
              <div className="text-center py-8">Loading team...</div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No team members found.</TableCell>
                    </TableRow>
                  ) : (
                    team.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Badge variant="secondary">{member.name}</Badge>
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={deletingId === member.id}
                            className="gap-2"
                          >
                            <Trash className="w-4 h-4" />
                            {deletingId === member.id ? 'Removing...' : 'Remove'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))
                  }
                  
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default InvestigatingTeamTabContent;