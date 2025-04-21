import React, { useState,useEffect  } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Users, FolderGit2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { Navbar } from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


const ManageDevelopers = () => {
  const { createDeveloper, getAllDevelopers, deleteDeveloper } = useAuth();
  const { projects } = useProjects();
  const { toast } = useToast();

  const [developers, setDevelopers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [developerToDelete, setDeveloperToDelete] = useState(null);

  // Fetch developers when the component mounts
  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const data = await getAllDevelopers();
        setDevelopers(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch developers.",
          variant: "destructive",
        });
      }
    };

    fetchDevelopers();
  }, [getAllDevelopers, toast]);

  const handleCreateDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createDeveloper(name, email, password);
      toast({ title: "Developer account created successfully" });

      const updatedList = await getAllDevelopers();
      setDevelopers(updatedList);

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create developer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (developer) => {
    setDeveloperToDelete(developer);
    setDeleteModalOpen(true);
  };

  const handleDeleteDeveloper = async () => {
    if (!developerToDelete) return;
    
    try {
      await deleteDeveloper(developerToDelete._id);
      toast({ 
        title: "Success", 
        description: "Developer deleted successfully" 
      });
      
      // Refresh the developers list
      const updatedList = await getAllDevelopers();
      setDevelopers(updatedList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete developer",
        variant: "destructive",
      });
    } finally {
      setDeleteModalOpen(false);
      setDeveloperToDelete(null);
    }
  };

  // Function to count projects assigned to a developer
  const getProjectCount = (developerId) => {
    return projects.filter(project => 
      project.assignedTo && project.assignedTo._id === developerId
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Manage Developers</h1>
          <p className="text-gray-500 mt-1">
            Add and manage developer team members
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Add New Developer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDeveloper} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter developer's full name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter developer's email"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set initial password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Developer Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Developer Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {developers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Projects</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {developers.map((developer) => (
                      <TableRow key={developer._id}>
                        <TableCell className="font-medium">{developer.name}</TableCell>
                        <TableCell>{developer.email}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <FolderGit2 className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="font-medium">{getProjectCount(developer._id)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(developer)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No developers added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Developer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {developerToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeveloper}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageDevelopers;
