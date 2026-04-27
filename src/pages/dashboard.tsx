import { Layout } from "@/components/layout";
import {
  useGetDashboardSummary,
  useGetActiveQueues,
} from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, ArrowRight, List, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activeQueues, isLoading: loadingQueues } = useGetActiveQueues();

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Queues</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-7 w-[60px]" />
              ) : (
                <div className="text-2xl font-bold">{summary?.activeQueues || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waiting</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-7 w-[60px]" />
              ) : (
                <div className="text-2xl font-bold">{summary?.totalStudentsWaiting || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Active Queues</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-7 w-[60px]" />
              ) : (
                <div className="text-2xl font-bold">{summary?.myActiveQueues || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-7 w-[60px]" />
              ) : (
                <div className="text-2xl font-bold">{summary?.completedToday || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">My Active Queues</h2>
          
          {loadingQueues ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeQueues && activeQueues.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeQueues.map((queue) => (
                <Card key={queue.id}>
                  <CardHeader>
                    <CardTitle>{queue.name}</CardTitle>
                    <CardDescription>{queue.department}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">My Position</p>
                        <p className="text-3xl font-bold text-primary">{queue.myPosition}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Est. Wait</p>
                        <p className="text-3xl font-bold">{queue.estimatedWaitMinutes} <span className="text-lg">min</span></p>
                      </div>
                    </div>
                    <Link href={`/queues/${queue.id}`}>
                      <Button className="w-full" variant="outline">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40 border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">You aren't in any queues</h3>
                <p className="text-muted-foreground mb-4">Join a queue to see your wait time here.</p>
                <Link href="/queues">
                  <Button>Browse Queues</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
