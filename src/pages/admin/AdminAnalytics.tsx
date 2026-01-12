import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, TrendingUp, Users, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminAnalytics() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-card rounded-xl p-12 text-center border border-border">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Analytics Dashboard</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Advanced analytics and reporting features are coming soon. Track your restaurant's performance with detailed insights.
          </p>
          <Badge variant="outline" className="text-accent border-accent">
            Coming Soon
          </Badge>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Calendar,
              title: "Booking Trends",
              description: "Track reservation patterns over time"
            },
            {
              icon: DollarSign,
              title: "Revenue Analytics",
              description: "Monitor income and growth metrics"
            },
            {
              icon: Users,
              title: "Customer Insights",
              description: "Understand your customer base"
            },
            {
              icon: TrendingUp,
              title: "Performance Metrics",
              description: "Key performance indicators"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

