import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { ContractService } from "@/services/contracts"

const formSchema = z.object({
  daoAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
})

export default function JoinDaoPage() {
  const navigate = useNavigate()
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [daoInfo, setDaoInfo] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daoAddress: "",
    },
  })

  useEffect(() => {
    const daoAddress = form.watch("daoAddress")
    if (daoAddress?.length === 42) {
      ContractService.getDaoName(daoAddress)
        .then(name => {
          setDaoInfo(name)
          setIsError(false)
        })
        .catch(() => {
          setDaoInfo(null)
          setIsError(true)
        })
    }
  }, [form.watch("daoAddress")])

  if (!address) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to join a DAO.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      await ContractService.joinDao(values.daoAddress)

      toast.success("Successfully joined the DAO!")
      navigate("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Failed to join DAO: " + (error as Error).message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Join Existing DAO</CardTitle>
          <CardDescription>
            Enter the address of the DAO you want to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="daoAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DAO Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0x..." 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the contract address of the DAO you want to join
                    </FormDescription>
                    <FormMessage />
                    {daoInfo && (
                      <Alert className="mt-2">
                        <AlertTitle>DAO Found</AlertTitle>
                        <AlertDescription>
                          Found DAO: {daoInfo}
                        </AlertDescription>
                      </Alert>
                    )}
                    {isError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          Could not find DAO at this address
                        </AlertDescription>
                      </Alert>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !daoInfo}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join DAO"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 