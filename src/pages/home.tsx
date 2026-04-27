import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Clock, Users, Shield, GraduationCap } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none max-w-3xl">
                  Skip the line. Own your time.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  CampusFlow is the smart way to manage university queues. From office hours to advising, join lines virtually and show up when it's your turn.
                </p>
              </div>
              <div className="space-x-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-12 px-8">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="h-12 px-8">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg" className="h-12 px-8">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Real-time wait estimates</h3>
                </div>
                <p className="text-muted-foreground">
                  Know exactly how long you'll be waiting. Our smart algorithm calculates wait times based on historical data and current queue speed.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Virtual queueing</h3>
                </div>
                <p className="text-muted-foreground">
                  Join lines from your dorm, the library, or the dining hall. Get notified when your turn is approaching so you never waste time standing in a hallway.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Secure access</h3>
                </div>
                <p className="text-muted-foreground">
                  Verified student access ensures queues remain fair and orderly. Admin tools give faculty complete control over their office hours.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Built for campus life</h3>
                </div>
                <p className="text-muted-foreground">
                  Tailored specifically for the university environment. Filter by department, set level restrictions, and manage high-volume periods with ease.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
