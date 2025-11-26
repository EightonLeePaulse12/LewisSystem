import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserOrders from "@/components/UserOrders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Upload,
  User,
  Mail,
  Phone,
  Camera,
  Save,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetProfile, UpdateProfile, UploadProfilePicture } from "@/api/auth";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"; // Assuming same path as RegisterForm

const Profile = () => {
  const queryClient = useQueryClient();

  // const [isUploading, setIsUploading] = useState(false); // Redundant
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { data: userProfile, isLoading } = useQuery({
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
      toast.error(error.message || "Failed to update profile details");
    },
  });

  const imageMutation = useMutation({
    mutationFn: UploadProfilePicture,
    onSuccess: (data) => {
      toast.success(data?.message || "Profile picture updated!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Failed to upload profile picture.");

      if (userProfile?.profilePicture) {
        setPreviewUrl(userProfile.profilePicture);
      } else {
        setPreviewUrl(null);
      }
    },
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
      });

      if (userProfile.profilePicture) {
        setPreviewUrl(userProfile.profilePicture);
      }
    }

    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
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
    console.log(file);

    if (file) {
      const url = URL.createObjectURL(file);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
      event.target.value = null;

      const formDataPayload = new FormData();
      formDataPayload.append("file", file);

      imageMutation.mutate(formDataPayload);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  const currentAvatarSource = previewUrl || "";

  return (
    <div className="container max-w-6xl py-10 mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900">
          <Settings className="w-8 h-8 text-red-500" />
          Account Settings
        </h2>
        <p className="text-gray-600">
          Manage your account profile, contact information, and view your order
          history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* --- Left Column: Profile Picture Card --- */}
        <Card className="h-full border-0 shadow-xl lg:col-span-1 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-xl">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            {/* Avatar Display & Click Handler */}
            <div className="relative group">
              <div
                className="relative w-40 h-40 overflow-hidden border-4 border-white rounded-full shadow-2xl cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={currentAvatarSource}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-6xl text-gray-400 bg-gray-100">
                    <User />
                  </AvatarFallback>
                </Avatar>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-black/40 group-hover:opacity-100">
                  <Camera className="w-10 h-10 text-white" />
                </div>

                {/* Loading Overlay */}
                {imageMutation.isPending && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Edit Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute p-2 text-white transition-colors bg-red-500 rounded-full shadow-lg bottom-2 right-2 hover:bg-red-600"
              >
                <Upload className="w-4 h-4" />
              </button>
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

            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-gray-900">
                {formData.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG (Max 5MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* --- Right Column: Personal Information Form --- */}
        <Card className="border-0 shadow-xl lg:col-span-2 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                <CardTitle className="text-xl">Personal Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name Input */}
                <Field>
                  <FieldLabel
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      disabled={textMutation.isPending}
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                {/* Phone Number Input */}
                <Field>
                  <FieldLabel
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </FieldLabel>
                  <div className="relative">
                    <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="phone"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="+1 234 567 890"
                      disabled={textMutation.isPending}
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                {/* Email Input (Read-only) */}
                <Field className="md:col-span-2">
                  <FieldLabel
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="py-3 pl-10 pr-4 text-gray-500 border-gray-200 rounded-lg cursor-not-allowed bg-gray-50"
                    />
                  </div>
                  <FieldDescription className="mt-1 text-xs text-gray-400">
                    Email address cannot be changed for security reasons.
                  </FieldDescription>
                </Field>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end px-6 py-4 bg-gray-50/50 rounded-b-xl">
              <Button
                type="submit"
                disabled={textMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white min-w-[140px] shadow-md"
              >
                {textMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
