import { useState } from "react"
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  Banknote,
  Building2,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Transaction {
  id: string
  type: "credit" | "debit"
  amount: number
  description: string
  date: string
  status: "completed" | "pending" | "failed"
  category: string
  riderId?: string
  riderName?: string
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "credit",
    amount: 320,
    description: "Ride earning from Indiranagar to Whitefield",
    date: "2024-01-15 14:30",
    status: "completed",
    category: "Ride Earning",
    riderId: "RK123",
    riderName: "Rahul Kumar",
  },
  {
    id: "2",
    type: "debit",
    amount: 280,
    description: "Ride payment to Electronic City",
    date: "2024-01-15 09:15",
    status: "completed",
    category: "Ride Payment",
    riderId: "PS456",
    riderName: "Priya Sharma",
  },
  {
    id: "3",
    type: "credit",
    amount: 150,
    description: "Refund for cancelled ride",
    date: "2024-01-14 18:45",
    status: "completed",
    category: "Refund",
  },
  {
    id: "4",
    type: "debit",
    amount: 500,
    description: "Wallet top-up via UPI",
    date: "2024-01-14 12:00",
    status: "pending",
    category: "Top-up",
  },
  {
    id: "5",
    type: "credit",
    amount: 450,
    description: "Ride earning from MG Road to Airport",
    date: "2024-01-13 16:20",
    status: "completed",
    category: "Ride Earning",
    riderId: "VM789",
    riderName: "Vikram Singh",
  },
  {
    id: "6",
    type: "debit",
    amount: 1000,
    description: "Withdrawal to bank account",
    date: "2024-01-12 10:30",
    status: "completed",
    category: "Withdrawal",
  },
]

const paymentMethods = [
  {
    id: "1",
    type: "UPI",
    name: "Google Pay",
    identifier: "user@okaxis",
    isDefault: true,
    icon: "📱",
  },
  {
    id: "2",
    type: "Card",
    name: "HDFC Debit Card",
    identifier: "**** **** **** 4532",
    isDefault: false,
    icon: "💳",
  },
  {
    id: "3",
    type: "Bank",
    name: "HDFC Bank",
    identifier: "****6789",
    isDefault: false,
    icon: "🏦",
  },
]

export function WalletPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const walletBalance = 2450
  const totalEarnings = 8920
  const totalSpent = 6470

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "credit") return transaction.type === "credit" && matchesSearch
    if (activeTab === "debit") return transaction.type === "debit" && matchesSearch
    
    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500/50 bg-green-500/10 text-green-400"
      case "pending":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
      case "failed":
        return "border-red-500/50 bg-red-500/10 text-red-400"
      default:
        return "border-white/20 bg-white/5 text-white/60"
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">Wallet</h1>
                <p className="text-xs md:text-sm text-white/40">Track your earnings and payments</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Section - Balance & Stats */}
              <div className="lg:col-span-4 space-y-6">
                {/* Wallet Balance Card */}
                <Card className="border-white/5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-white/60 mb-1">Total Earnings</p>
                    <h2 className="text-4xl font-bold text-white mb-2">₹{totalEarnings.toLocaleString()}</h2>
                    <p className="text-xs text-white/40">From completed rides</p>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4">
                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-white/60">This Month</p>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">₹{walletBalance.toLocaleString()}</p>
                      <p className="text-xs text-green-500">+23% from last month</p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <p className="text-xs text-white/60">Ride Payments</p>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">₹{totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-red-500">For booked rides</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-400">
                          💡 Earnings are automatically transferred to your bank account every Friday
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Section - Transactions */}
              <div className="lg:col-span-8">
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg font-semibold text-white">Transaction History</CardTitle>
                        <CardDescription className="text-xs text-white/40">
                          {filteredTransactions.length} transactions found
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <Input
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9"
                          />
                        </div>
                        <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-white/60 hover:text-white h-9 w-9 shrink-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <div className="p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="bg-white/5 border border-white/10 p-1 w-full sm:w-auto mb-4">
                        <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="credit" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Credits
                        </TabsTrigger>
                        <TabsTrigger value="debit" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Debits
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="mt-0">
                        <ScrollArea className="h-[calc(100vh-420px)]">
                          <div className="space-y-3 pr-4">
                            {filteredTransactions.length === 0 ? (
                              <Card className="border-white/5 bg-white/5">
                                <CardContent className="p-12 text-center">
                                  <Wallet className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                  <p className="text-white/60">No transactions found</p>
                                  <p className="text-sm text-white/40 mt-1">Try adjusting your filters</p>
                                </CardContent>
                              </Card>
                            ) : (
                              filteredTransactions.map((transaction) => (
                                <Card
                                  key={transaction.id}
                                  className="border-white/5 bg-white/5 hover:bg-white/10 transition-all"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                                          transaction.type === "credit" 
                                            ? "bg-green-500/10" 
                                            : "bg-red-500/10"
                                        }`}>
                                          {transaction.type === "credit" ? (
                                            <ArrowDownLeft className="h-5 w-5 text-green-500" />
                                          ) : (
                                            <ArrowUpRight className="h-5 w-5 text-red-500" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-medium text-white break-words">
                                              {transaction.description}
                                            </p>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                                            <Calendar className="w-3 h-3" />
                                            <span>{transaction.date}</span>
                                            {transaction.riderName && (
                                              <>
                                                <span>•</span>
                                                <span>{transaction.riderName}</span>
                                              </>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="border-white/10 text-white/60 text-xs">
                                              {transaction.category}
                                            </Badge>
                                            <Badge variant="outline" className={`text-xs ${getStatusColor(transaction.status)}`}>
                                              {getStatusIcon(transaction.status)}
                                              <span className="ml-1 capitalize">{transaction.status}</span>
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className={`text-lg font-bold ${
                                          transaction.type === "credit" 
                                            ? "text-green-500" 
                                            : "text-red-500"
                                        }`}>
                                          {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
