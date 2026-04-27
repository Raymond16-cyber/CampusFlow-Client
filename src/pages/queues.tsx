import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import {
  useListQueues,
  useJoinQueue,
  useLeaveQueue,
  getListQueuesQueryKey,
  getGetActiveQueuesQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Clock, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const DEPARTMENTS = [
  "All",
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Arts",
  "Sciences",
  "Other",
];

export default function Queues() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queues, isLoading } = useListQueues(
    department !== "All" ? { department } : undefined
  );

  const joinMutation = useJoinQueue();
  const leaveMutation = useLeaveQueue();

  const handleJoin = (id: number) => {
    joinMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Joined queue successfully" });
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

  const handleLeave = (id: number) => {
    leaveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Left queue successfully" });
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

  const filteredQueues = queues?.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Available Queues</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search queues..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredQueues && filteredQueues.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQueues.map((queue) => (
              <Card key={queue.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{queue.name}</CardTitle>
                      <CardDescription>{queue.department}</CardDescription>
                    </div>
                    <Badge variant={queue.status === "active" ? "default" : "secondary"}>
                      {queue.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {queue.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{queue.currentSize} waiting</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>~{queue.estimatedWaitPerPerson} min/person</span>
                    </div>
                  </div>
                  {queue.allowedLevel && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted inline-block px-2 py-1 rounded">
                      Level: {queue.allowedLevel}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t gap-2">
                  <Link href={`/queues/${queue.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Details
                    </Button>
                  </Link>
                  <Button
                    className="flex-1"
                    disabled={queue.status !== "active"}
                    onClick={() => handleJoin(queue.id)}
                  >
                    Join
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium mb-2">No queues found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or department filter.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
