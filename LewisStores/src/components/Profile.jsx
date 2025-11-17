import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetProfile, UpdateProfile } from "@/api/auth";
// import { useAuth } from "@/hooks/useAuth";

// *** NOTE: You will need to define and export this function in your '@/api/auth' file ***
// It should accept a FormData object containing the file and return a promise.
const UploadProfilePicture = async (formDataPayload) => {
  // Simulate an API call with the file data
  const token = localStorage.getItem("token");
  const response = await fetch("/api/customers/profile-picture", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formDataPayload, // FormData does not need Content-Type header
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
  return response.json();
};

const Profile = () => {
  const queryClient = useQueryClient();
   // Assuming this is for other global details // The isUploading state is correctly used by the imageMutation hook

  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  }); // This state holds EITHER the Base64 URL (from fetch) OR the temporary object URL (from selection)

  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const {
    data: userProfile,
    isLoading, // TanStack Query's loading state
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: GetProfile,
    refetchOnWindowFocus: false,
  });

  const textMutation = useMutation({
    mutationFn: UpdateProfile,
    onSuccess: () => {
      toast.success("Profile details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Text update failed:", error);
      toast.error("Failed to update profile details");
    },
  });

  const imageMutation = useMutation({
    mutationFn: UploadProfilePicture,
    onMutate: () => setIsUploading(true),
    onSuccess: () => {
      toast.success("Profile picture updated!"); // Invalidate to pull the fresh image data from the server
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload profile picture.");
      // Optional: Revert preview URL if upload fails
      // setPreviewUrl(userProfile?.profilePicture ? `data:image/jpeg;base64,${userProfile.profilePicture}` : null);
    },
    onSettled: () => setIsUploading(false),
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
      }); // 1. Load the existing Base64 picture URL when data is fetched

      if (userProfile.profilePicture) {
        setPreviewUrl(`data:image/jpeg;base64,${userProfile.profilePicture}`);
      } else if (!previewUrl) {
        // Clear previewUrl if the user profile has no picture and no temporary preview is set
        setPreviewUrl(null);
      }
    }
  }, [userProfile, previewUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    textMutation.mutate({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
    });
  };
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // 1. Create a **local object URL** to display the preview immediately
      const url = URL.createObjectURL(file);
      setPreviewUrl(url); // This ensures the new image shows instantly

      // Clear the input value so the same file can be selected again if needed
      event.target.value = null; // 2. Prepare FormData for the API call

      const formDataPayload = new FormData();
      formDataPayload.append("file", file); // 3. Trigger the image mutation
      imageMutation.mutate(formDataPayload);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />{" "}
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 mx-auto space-y-8">
      {/* --- Header/Title Section --- */}{" "}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>{" "}
        <p className="text-muted-foreground">
          Manage your account settings and profile preferences.{" "}
        </p>{" "}
      </div>
      <Separator /> {/* --- Profile Picture Card --- */}{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>{" "}
          <CardDescription>
            Click the image to upload a new photo.
          </CardDescription>{" "}
        </CardHeader>{" "}
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar Display & Click Handler */}{" "}
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {" "}
            <Avatar className="w-24 h-24 transition-opacity border-4 shadow-sm border-muted group-hover:opacity-75">
              {" "}
              {/* 🐛 FIX: Use component state 'previewUrl' for the image source */}
              {/* 🐛 FIX: Replaced objectFit prop with className="object-cover" */}{" "}
              <AvatarImage src={previewUrl || ""} className="object-cover" />{" "}
              <AvatarFallback className="text-4xl">
                <User />
              </AvatarFallback>{" "}
            </Avatar>{" "}
            <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
              {" "}
              <Upload className="w-6 h-6 text-white drop-shadow-md" />{" "}
            </div>{" "}
          </div>
          {/* Hidden File Input */}{" "}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={imageMutation.isPending}
          />
          {/* Upload Button */}{" "}
          <div className="flex-1 space-y-2">
            <h3 className="font-medium">Upload a new photo</h3>{" "}
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG or WEBP.{" "}
            </p>{" "}
            <Button
              variant="outline"
              disabled={imageMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {" "}
              {imageMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              {imageMutation.isPending ? "Uploading..." : "Select Image"}{" "}
            </Button>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>
      {/* --- Personal Information Card --- */}{" "}
      <Card>
        {" "}
        <form onSubmit={handleSubmit}>
          {" "}
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>{" "}
            <CardDescription>
              Update your personal details here.
            </CardDescription>{" "}
          </CardHeader>{" "}
          <CardContent className="space-y-4">
            {" "}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name Input */}{" "}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>{" "}
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  disabled={textMutation.isPending}
                />{" "}
              </div>
              {/* Phone Number Input */}{" "}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>{" "}
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="+1 234 567 890"
                  disabled={textMutation.isPending}
                />{" "}
              </div>{" "}
            </div>
            {/* Email Input (Read-only) */}{" "}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>{" "}
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />{" "}
              <p className="text-[0.8rem] text-muted-foreground">
                Email cannot be changed.
              </p>{" "}
            </div>{" "}
          </CardContent>{" "}
          <CardFooter className="px-6 py-4 border-t bg-muted/50">
            {" "}
            <Button type="submit" disabled={textMutation.isPending}>
              {" "}
              {textMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              {textMutation.isPending ? "Saving..." : "Save Changes"}{" "}
            </Button>{" "}
          </CardFooter>{" "}
        </form>{" "}
      </Card>{" "}
    </div>
  );
};

export default Profile;
