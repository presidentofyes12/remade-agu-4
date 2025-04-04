import React from 'react'
import { useAccount } from 'wagmi'
import { Store, Plus, ArrowRight } from 'lucide-react'

const Marketplace: React.FC = () => {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Connect Your Wallet
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please connect your wallet to view and trade resources in the marketplace.
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
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and trade resources, tools, and services within the AGU DAO ecosystem.
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Plus className="h-5 w-5 mr-2" />
            List Resource
          </button>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Example Resource Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Store className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Data Analysis Tool</dt>
                    <dd className="flex items-baseline">
                      <div className="text-sm text-gray-900">100 AGU</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  A powerful tool for analyzing and visualizing scientific data.
                </p>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Example Resource Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Store className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Research Dataset</dt>
                    <dd className="flex items-baseline">
                      <div className="text-sm text-gray-900">50 AGU</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Comprehensive dataset for climate change research.
                </p>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Example Resource Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Store className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Consulting Service</dt>
                    <dd className="flex items-baseline">
                      <div className="text-sm text-gray-900">200 AGU/hour</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Expert consulting services for research methodology and data analysis.
                </p>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-8 text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resources found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by listing your first resource or browsing existing ones.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <Plus className="h-5 w-5 mr-2" />
              List Resource
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marketplace 