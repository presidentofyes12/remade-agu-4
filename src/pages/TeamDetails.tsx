import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const TeamDetails: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>()

  // In a real app, you would fetch team details based on teamId
  const teamName = `Team ${teamId}` // Placeholder name

  return (
    <div className="space-y-6">
      <div>
        <Link to="/teams" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Link>
        <h1 className="text-3xl font-bold">{teamName}</h1>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Team Details</h2>
        {/* Placeholder content - Add actual team details here */}
        <p>Details for team ID: {teamId}</p>
        <p>Team members, projects, proposals, etc. would go here.</p>
      </div>
    </div>
  )
}

export default TeamDetails 