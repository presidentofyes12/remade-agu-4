import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { Users, Plus, ArrowRight } from 'lucide-react'
import { Team, mockTeams } from '@/types/team'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

const Teams: React.FC = () => {
  const { isConnected } = useAccount()
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      description: newTeam.description,
      memberCount: 1, // Start with 1 member (the creator)
    }
    setTeams([...teams, team])
    setNewTeam({ name: '', description: '' })
    setIsCreateModalOpen(false)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Connect Your Wallet
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please connect your wallet to view and manage teams.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="mt-1 text-sm text-gray-500">
              Join or create teams to collaborate on projects and initiatives.
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={newTeam.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTeam.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTeam({ ...newTeam, description: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">Create Team</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div key={team.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{team.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-sm text-gray-900">{team.memberCount} members</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{team.description}</p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/teams/${team.id}`}
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View Team
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {teams.length === 0 && (
          <div className="mt-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new team or joining an existing one.
            </p>
            <div className="mt-6">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Team</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Team Name</Label>
                      <Input
                        id="name"
                        value={newTeam.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam({ ...newTeam, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTeam.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTeam({ ...newTeam, description: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit">Create Team</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Teams 