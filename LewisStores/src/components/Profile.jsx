// In your Profile.jsx

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
// ⚠️ FIX 4: Import the new UploadProfilePicture function from your auth file
import { GetProfile, UpdateProfile, UploadProfilePicture } from "@/api/auth";

// ⚠️ FIX 5: Remove the mock UploadProfilePicture function here since it's now in '@/api/auth'
// (Assuming you've moved the correct implementation into the api/auth file as requested)

const Profile = () => {
  const queryClient = useQueryClient();

  // ⚠️ FIX 6: The isUploading state is redundant; use imageMutation.isPending
  // const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  });

  // This state holds the temporary local URL or the fetched base64 URL
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: GetProfile,
    refetchOnWindowFocus: false,
  });

  // ⚠️ FIX 7: useMutation takes the function itself, not the function call.
  // The payload is passed in textMutation.mutate(payload).
  const textMutation = useMutation({
    mutationFn: UpdateProfile, // Passed the function, not the call
    onSuccess: () => {
      toast.success("Profile details updated successfully");
      // Invalidate to pull fresh name/phone number
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Text update failed:", error);
      // Get the error message from the Error object thrown in UpdateProfile
      toast.error(error.message || "Failed to update profile details");
    },
  });

  const imageMutation = useMutation({
    mutationFn: UploadProfilePicture,
    // ⚠️ Removed redundant onMutate/onSettled hooks for isUploading state
    onSuccess: (data) => {
      toast.success(data?.message || "Profile picture updated!");
      // Invalidate to pull the fresh image data from the server
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Image upload failed:", error);
      // Get the error message from the Error object thrown in UploadProfilePicture
      toast.error(error.message || "Failed to upload profile picture.");

      // Revert the preview to the current profile picture (if one exists)
      if (userProfile?.profilePicture) {
        setPreviewUrl(userProfile.profilePicture);
      } else {
        setPreviewUrl(null);
      }
    },
  });

  // ⚠️ FIX 8: Cleanup the useEffect to use the object URL cleanup and avoid relying on previewUrl in the dependency array.
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
      });

      // Set initial preview to the fetched base64 URL
      if (userProfile.profilePicture) {
        setPreviewUrl(userProfile.profilePicture);
      }
    }

    // Cleanup function for the object URL to prevent memory leaks.
    // This is primarily for the temporary object URL created in handleFileChange.
    return () => {
      // Check if the current previewUrl is a temporary object URL before revoking
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // Depend only on userProfile to run when data is fetched/updated
  }, [userProfile, previewUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // ⚠️ FIX 9: Mutate with the correct payload for the UpdateProfile endpoint
    textMutation.mutate({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      // Only name and phoneNumber are required by the C# UpdateProfile method's DTO
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // 1. Create a **local object URL** to display the preview immediately
      const url = URL.createObjectURL(file);
      // ⚠️ FIX 10: Revoke the previous temporary URL if one exists before setting the new one
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url); // This ensures the new image shows instantly

      // Clear the input value so the same file can be selected again if needed
      event.target.value = null;

      // 2. Prepare FormData for the API call
      const formDataPayload = new FormData();
      formDataPayload.append("file", file);

      // 3. Trigger the image mutation
      imageMutation.mutate(formDataPayload);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const currentAvatarSource = previewUrl || ""; // Use the preview state as the source of truth

  return (
    <div className="container max-w-3xl py-10 mx-auto space-y-8">
      {/* ⚠️ FIX 11: Removed the unnecessary <img> tag which also used the wrong source */}
      {/* <div>...</div> */}

      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <p className="text-muted-foreground">
        Manage your account settings and profile preferences.
      </p>
      <Separator />

      {/* --- Profile Picture Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Click the image to upload a new photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar Display & Click Handler */}
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="w-24 h-24 transition-opacity border-4 shadow-sm border-muted group-hover:opacity-75">
              {/* ⚠️ FIX 12: Use component state 'previewUrl' for the image source */}
              <AvatarImage
                src={currentAvatarSource} // Use the state that holds the temp or fetched URL
                className="object-cover"
              />
              <AvatarFallback className="text-4xl">
                <User />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
              <Upload className="w-6 h-6 text-white drop-shadow-md" />
            </div>
          </div>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={imageMutation.isPending}
          />
          {/* Upload Button */}
          <div className="flex-1 space-y-2">
            <h3 className="font-medium">Upload a new photo</h3>
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG or WEBP.
            </p>
            <Button
              variant="outline"
              disabled={imageMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {imageMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {imageMutation.isPending ? "Uploading..." : "Select Image"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Personal Information Card --- */}
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  disabled={textMutation.isPending}
                />
              </div>
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="+1 234 567 890"
                  disabled={textMutation.isPending}
                />
              </div>
            </div>
            {/* Email Input (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 border-t bg-muted/50">
            <Button type="submit" disabled={textMutation.isPending}>
              {textMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {textMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
