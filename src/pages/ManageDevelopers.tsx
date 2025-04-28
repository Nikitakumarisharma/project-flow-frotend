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
import { UserPlus, Users, FolderGit2, Trash2, Eye, EyeOff, Edit2, Lock, ChevronLeft, ChevronRight } from "lucide-react";
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
  const { createDeveloper, getAllDevelopers, deleteDeveloper, updateDeveloper, user } = useAuth();
  const { projects } = useProjects();
  const { toast } = useToast();

  const [developers, setDevelopers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [developerToDelete, setDeveloperToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const developersPerPage = 4;

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

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setEditMode(false);
    setSelectedDeveloper(null);
  };

  const handleEditDeveloper = (developer) => {
    setEditMode(true);
    setSelectedDeveloper(developer);
    setName(developer.name);
    setEmail(developer.email);
    setPassword(""); // Clear password field in edit mode
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editMode && selectedDeveloper) {
        // Update existing developer
        const updateData = {
          name,
          email,
          ...(password && { password }) // Only include password if it's been changed
        };
        
        await updateDeveloper(selectedDeveloper._id, updateData);
        toast({ title: "Developer updated successfully" });
      } else {
        // Create new developer
        await createDeveloper(name, email, password);
        toast({ title: "Developer account created successfully" });
      }

      const updatedList = await getAllDevelopers();
      setDevelopers(updatedList);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} developer`,
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingPassword(true);
    try {
      await updateDeveloper(user._id, { password: newPassword });
      toast({ title: "Password updated successfully" });
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const totalPages = Math.ceil(developers.length / developersPerPage);
  const currentDevelopers = developers.slice(
    currentPage * developersPerPage,
    (currentPage + 1) * developersPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
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
                {editMode ? (
                  <>
                    <Edit2 className="h-5 w-5 mr-2" />
                    Edit Developer
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add New Developer
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    {editMode ? "New Password (leave blank to keep unchanged)" : "Password"}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editMode ? "Enter new password" : "Set initial password"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (editMode ? "Updating..." : "Creating...") 
                      : (editMode ? "Update Developer" : "Create Developer Account")}
                  </Button>
                  {editMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Developer Team
                  </div>
                  {developers.length > developersPerPage && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-500">
                        {currentPage + 1} of {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentDevelopers.length > 0 ? (
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
                      {currentDevelopers.map((developer) => (
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
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditDeveloper(developer)}
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteModal(developer)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Your Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card> */}
          </div>
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
