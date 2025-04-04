import React from 'react'
import { useAccount } from 'wagmi'
import { FileText, Users, Store, ArrowRight } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { isConnected, address } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Connect Your Wallet
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please connect your wallet to access the dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to your Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Your wallet address: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Proposals Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Proposals</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
                  View Proposals
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Teams Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Your Teams</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
                  View Teams
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Marketplace Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Store className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Marketplace Items</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
                  View Marketplace
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-4 bg-white shadow rounded-lg">
            <div className="p-6">
              <p className="text-gray-500 text-center">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 