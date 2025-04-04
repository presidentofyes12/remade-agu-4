import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccount } from "wagmi"

export default function DashboardPage() {
  const navigate = useNavigate()
  const { address } = useAccount()
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-600 mb-6">Your wallet address: {address}</p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => navigate("/create-dao")}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            Create New DAO
          </Button>
          <Button 
            onClick={() => navigate("/join-dao")}
            variant="outline"
            size="lg"
          >
            Join Existing DAO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Proposals</CardTitle>
            <CardDescription>Proposals requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <Button 
              variant="link" 
              className="px-0"
              onClick={() => navigate("/proposals")}
            >
              View Proposals →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Teams</CardTitle>
            <CardDescription>Teams you're participating in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <Button 
              variant="link" 
              className="px-0"
              onClick={() => navigate("/teams")}
            >
              View Teams →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketplace Items</CardTitle>
            <CardDescription>Available items for trade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <Button 
              variant="link" 
              className="px-0"
              onClick={() => navigate("/marketplace")}
            >
              View Marketplace →
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 text-center">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 