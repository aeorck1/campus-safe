
'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash, UserPlus, Users } from 'lucide-react';

function InvestigatingTeamTabContent() {
  const getInvestigatingTeam = useAuthStore((state) => state.getInvestigatingTeam);
  const postInvestigatingTeam = useAuthStore((state) => state.postInvestigatingTeam);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const payload = { name: newMember.name, email: newMember.email };
      const res = await postInvestigatingTeam(id,  payload);
      if (res && res.success) {
        // Refresh team
        const teamRes = await getInvestigatingTeam();
        if (teamRes && teamRes.success && Array.isArray(teamRes.data)) setTeam(teamRes.data);
        setNewMember({ name: '', email: '' });
      } else {
        setError(res?.message || 'Failed to add member.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add member.');
    } finally {
      setCreating(false);
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> Investigating Team
        </CardTitle>
        <CardDescription>Manage the list of team members responsible for incident investigation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-2 mb-6">
          <Input
            type="text"
            placeholder="Name"
            value={newMember.name}
            onChange={e => setNewMember({ ...newMember, name: e.target.value })}
            disabled={creating}
            required
            className="md:w-1/4"
          />
          <Input
            type="email"
            placeholder="Email"
            value={newMember.email}
            onChange={e => setNewMember({ ...newMember, email: e.target.value })}
            disabled={creating}
            required
            className="md:w-1/2"
          />
          <Button type="submit" disabled={creating || !newMember.name.trim() || !newMember.email.trim()} className="flex gap-2">
            <UserPlus className="w-4 h-4" />
            {creating ? 'Adding...' : 'Add Member'}
          </Button>
        </form>
        {error && <div className="text-destructive mb-2">{error}</div>}
        {loading ? (
          <div className="text-center py-8">Loading team...</div>
        ) : (
          <Table>
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default InvestigatingTeamTabContent;