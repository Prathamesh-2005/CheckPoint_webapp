import { useState } from "react"
import {
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  FileText,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Send,
  BookOpen,
  Users,
  MapPin,
  CreditCard,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  icon: any
}

const faqs: FAQ[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "How do I book a ride?",
    answer: "To book a ride, go to 'Find Ride', enter your pickup and drop locations, search for available rides, and click 'Request' on your preferred ride. The driver will receive your request and can accept or decline.",
    icon: MapPin,
  },
  {
    id: "2",
    category: "Getting Started",
    question: "How do I offer a ride?",
    answer: "Go to 'Offer Ride', fill in your route details (starting point, destination, date & time), enter your bike details and price. Your ride will be visible to passengers searching for rides on your route.",
    icon: Users,
  },
  {
    id: "3",
    category: "Payments",
    question: "How does payment work?",
    answer: "Payments are automatic. When you complete a ride as a passenger, the amount is deducted. As a driver, you receive earnings directly to your bank account every Friday. All transactions are secure and instant.",
    icon: CreditCard,
  },
  {
    id: "4",
    category: "Payments",
    question: "When will I receive my earnings?",
    answer: "Earnings from completed rides are automatically transferred to your linked bank account every Friday. You can track pending and completed payouts in the Wallet section.",
    icon: CreditCard,
  },
  {
    id: "5",
    category: "Safety",
    question: "How do you ensure rider safety?",
    answer: "We verify all users through KYC, track all rides in real-time, allow in-app emergency contacts, and have a 24/7 support team. Both riders and drivers can rate each other after every ride.",
    icon: Shield,
  },
  {
    id: "6",
    category: "Safety",
    question: "What should I do in case of an emergency?",
    answer: "Use the emergency button in the app to alert our support team and your emergency contacts. You can also call local emergency services (112). We'll immediately track your location and assist you.",
    icon: AlertTriangle,
  },
  {
    id: "7",
    category: "Account",
    question: "How do I verify my account?",
    answer: "Go to Settings > Verification. Upload your government ID (Aadhaar/PAN/Driving License) and a selfie. Verification usually takes 24-48 hours. You'll be notified via email and app notification.",
    icon: Settings,
  },
  {
    id: "8",
    category: "Account",
    question: "Can I cancel a ride?",
    answer: "Yes, you can cancel a ride before it starts. However, repeated cancellations may affect your rating. If you need to cancel, please inform the other party through chat to maintain good etiquette.",
    icon: FileText,
  },
]

const quickLinks = [
  {
    title: "Safety Guidelines",
    description: "Learn about our safety measures",
    icon: Shield,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    title: "Terms & Conditions",
    description: "Read our terms of service",
    icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Privacy Policy",
    description: "How we protect your data",
    icon: Shield,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Community Guidelines",
    description: "Be a responsible rider",
    icon: Users,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
]

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [supportMessage, setSupportMessage] = useState("")
  const [supportSubject, setSupportSubject] = useState("")

  const categories = ["all", ...Array.from(new Set(faqs.map(faq => faq.category)))]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  const handleSubmitSupport = () => {
    // Handle support form submission
    console.log({ subject: supportSubject, message: supportMessage })
    setSupportSubject("")
    setSupportMessage("")
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
                  <HelpCircle className="w-6 h-6" />
                  Help & Support
                </h1>
                <p className="text-xs md:text-sm text-white/40">Get answers and assistance</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            {/* Search Bar */}
            <Card className="border-white/5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">How can we help you?</h2>
                  <p className="text-sm text-white/60">Search for answers or browse categories below</p>
                </div>
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    placeholder="Search for help articles, FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <Phone className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Call Support</p>
                      <p className="text-xs text-white/60">24/7 Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                      <MessageCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Live Chat</p>
                      <p className="text-xs text-white/60">Get instant help</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                      <Mail className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Email Us</p>
                      <p className="text-xs text-white/60">support@checkpoint.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Emergency</p>
                      <p className="text-xs text-white/60">SOS Support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* FAQs Section */}
              <div className="lg:col-span-8">
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-lg font-semibold text-white">
                      Frequently Asked Questions
                    </CardTitle>
                    <CardDescription className="text-xs text-white/40">
                      Find quick answers to common questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveCategory(category)}
                          className={`${
                            activeCategory === category
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-white/20 text-white/60 hover:text-white hover:bg-white/10'
                          } whitespace-nowrap`}
                        >
                          {category === "all" ? "All" : category}
                        </Button>
                      ))}
                    </div>

                    <ScrollArea className="h-[calc(100vh-500px)]">
                      <div className="space-y-3 pr-4">
                        {filteredFaqs.length === 0 ? (
                          <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">No FAQs found</p>
                            <p className="text-sm text-white/40 mt-1">Try a different search or category</p>
                          </div>
                        ) : (
                          filteredFaqs.map((faq) => (
                            <Card
                              key={faq.id}
                              className="border-white/5 bg-white/5 hover:bg-white/10 transition-all"
                            >
                              <CardContent className="p-4">
                                <button
                                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                  className="w-full text-left"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
                                      <faq.icon className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-white">{faq.question}</h3>
                                        {expandedFaq === faq.id ? (
                                          <ChevronDown className="h-5 w-5 text-white/60 flex-shrink-0" />
                                        ) : (
                                          <ChevronRight className="h-5 w-5 text-white/60 flex-shrink-0" />
                                        )}
                                      </div>
                                      {expandedFaq === faq.id && (
                                        <p className="text-sm text-white/70 mt-2 leading-relaxed">
                                          {faq.answer}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Contact Support */}
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-white">Contact Support</CardTitle>
                    <CardDescription className="text-xs text-white/40">
                      Can't find what you're looking for?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Subject"
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                    <Textarea
                      placeholder="Describe your issue..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                    />
                    <Button
                      onClick={handleSubmitSupport}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!supportSubject || !supportMessage}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-white">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {quickLinks.map((link, index) => (
                        <button
                          key={index}
                          className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${link.bg}`}>
                              <link.icon className={`h-4 w-4 ${link.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">{link.title}</p>
                              <p className="text-xs text-white/60">{link.description}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white/60" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Support Hours */}
                <Card className="border-white/5 bg-gradient-to-br from-green-500/10 to-blue-500/10">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 mb-3">
                        <Phone className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">We're Here 24/7</h3>
                      <p className="text-xs text-white/60 mb-3">
                        Our support team is always available to help you
                      </p>
                      <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400">
                        Available Now
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
