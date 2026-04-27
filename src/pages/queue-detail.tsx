import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import {
  useGetQueue,
  useJoinQueue,
  useLeaveQueue,
  getGetQueueQueryKey,
  getListQueuesQueryKey,
  getGetActiveQueuesQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Clock, Users, CalendarDays, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function QueueDetail() {
  const { id } = useParams();
  const queueId = Number(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: queue, isLoading } = useGetQueue(queueId, {
    query: {
      enabled: !!queueId,
    }
  });

  const joinMutation = useJoinQueue();
  const leaveMutation = useLeaveQueue();

  const myEntry = queue?.entries?.find(
    (e) => e.userId === user?.id && e.status === "waiting"
  );

  const handleJoin = () => {
    joinMutation.mutate(
      { id: queueId },
      {
        onSuccess: () => {
          toast({ title: "Joined queue successfully" });
          queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey(queueId) });
          queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetActiveQueuesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to join queue",
            description: error.error || "An error occurred.",
          });
        },
      }
    );
  };

  const handleLeave = () => {
    leaveMutation.mutate(
      { id: queueId },
      {
        onSuccess: () => {
          toast({ title: "Left queue successfully" });
          queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey(queueId) });
          queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetActiveQueuesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to leave queue",
            description: error.error || "An error occurred.",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 px-4 md:px-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!queue) {
    return (
      <Layout>
        <div className="container py-8 px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Queue not found</h2>
          <Button onClick={() => setLocation("/queues")}>Back to Queues</Button>
        </div>
      </Layout>
    );
  }

  const isLevelAllowed =
    !queue.allowedLevel || queue.allowedLevel === user?.level;

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6 max-w-4xl">
        <Link
          href="/queues"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Queues
        </Link>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{queue.name}</h1>
                <Badge variant={queue.status === "active" ? "default" : "secondary"} className="text-sm px-3 py-1">
                  {queue.status}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {queue.description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" /> Waiting
                  </span>
                  <p className="font-medium text-lg">{queue.currentSize}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Est. Wait
                  </span>
                  <p className="font-medium text-lg">~{queue.estimatedWaitPerPerson}m</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> Created
                  </span>
                  <p className="font-medium">{format(new Date(queue.createdAt), "MMM d")}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4" /> Level Limit
                  </span>
                  <p className="font-medium">{queue.allowedLevel || "None"}</p>
                </div>
              </div>
            </div>

            {myEntry ? (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Your Position</CardTitle>
                  <CardDescription>You are currently in this queue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex justify-center gap-12 w-full sm:w-auto">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Position</p>
                        <p className="text-5xl font-bold text-primary">{myEntry.position}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Wait Time</p>
                        <p className="text-5xl font-bold">{myEntry.estimatedWaitMinutes}<span className="text-2xl">m</span></p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="lg"
                      disabled={leaveMutation.isPending}
                      onClick={handleLeave}
                      className="w-full sm:w-auto"
                    >
                      {leaveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Leave Queue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Join Queue</CardTitle>
                  <CardDescription>
                    Add yourself to the waitlist to reserve your spot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isLevelAllowed ? (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-md mb-4 flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5" />
                      <span>This queue is restricted to {queue.allowedLevel} students.</span>
                    </div>
                  ) : null}
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={
                      queue.status !== "active" ||
                      !isLevelAllowed ||
                      joinMutation.isPending
                    }
                    onClick={handleJoin}
                  >
                    {joinMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {queue.status !== "active"
                      ? "Queue is not active"
                      : "Join Waitlist"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Current Line</CardTitle>
                <CardDescription>{queue.currentSize} people waiting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queue.entries?.filter(e => e.status === 'waiting').sort((a, b) => a.position - b.position).length > 0 ? (
                    queue.entries
                      .filter(e => e.status === 'waiting')
                      .sort((a, b) => a.position - b.position)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            entry.userId === user?.id ? "bg-primary/10 border-primary/30" : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted font-bold text-sm">
                              {entry.position}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {entry.userId === user?.id ? "You" : `Student #${entry.userId}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Joined {format(new Date(entry.joinedAt), "h:mm a")}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">~{entry.estimatedWaitMinutes}m</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No one is waiting in line yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
