"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_IDS = {
  "Advanced Java": {
    Main: -1002354703805,
    Theory: -1002380915545,
    Practical: -1002428084012,
  },
  "Data Analytics with Python": {
    Main: -1002440181008,
    Theory: -1002453320466,
    Practical: -1002428199055,
  },
  "Human Computer Interface": {
    Main: -1002384952840,
    Theory: -1002445086870,
    Practical: -1002227802139,
  },
  "Mobile Application Development": {
    Main: -1002255805116,
    Theory: -1002279502965,
    Practical: -1002342357608,
  },
  "Probability Statistics": {
    Main: -1002276329421,
    Theory: -1002321230535,
    Practical: -1002493518633,
  },
  "Software Engineering": {
    Main: -1002370893044,
    Theory: -1002344359474,
    Practical: -1002424851036,
  }
} as const;

export default function NotesPage() {
  const { userId } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"Main" | "Theory" | "Practical">("Main");
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserSubjects = async () => {
      try {
        const response = await fetch("/api/user-subjects");
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const subjects = await response.json();
        setUserSubjects(subjects);
      } catch (error) {
        console.error("Error fetching user subjects:", error);
        toast.error("Failed to load subjects");
      }
    };

    fetchUserSubjects();
  }, [userId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedSubject || !userId || !selectedFile) {
      toast.error("Please select a subject and file first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("subject", selectedSubject);
      formData.append("uploadType", uploadType);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      toast.success("File uploaded successfully!");
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const uniqueSubjects = Array.from(new Set(userSubjects));

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <Card className="mb-6 shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Study Materials</CardTitle>
          <CardDescription>
            Share your notes and materials with your classmates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select 
                onValueChange={setSelectedSubject}
                value={selectedSubject || undefined}
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={uploadType} 
                onValueChange={(value: "Main" | "Theory" | "Practical") => setUploadType(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main">Main</SelectItem>
                  <SelectItem value="Theory">Theory</SelectItem>
                  <SelectItem value="Practical">Practical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              <div className="grid w-full gap-1.5">
                {!selectedFile ? (
                  <label
                    htmlFor="file-upload"
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-32",
                      "border-2 border-dashed border-muted-foreground/25",
                      "rounded-lg cursor-pointer",
                      "hover:bg-muted/50 transition-colors duration-200",
                      "relative overflow-hidden"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                      <svg
                        className="w-8 h-8 mb-3 text-muted-foreground"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground/75">
                        Upload any File
                      </p>
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-24 w-24 rounded-lg border bg-background flex items-center justify-center">
                          {selectedFile?.type.startsWith("image/") ? (
                            <img 
                              src={filePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                              <svg
                                className="w-8 h-8 mb-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                />
                              </svg>
                              <span className="text-xs">Document</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium truncate">{selectedFile?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile?.size || 0) / 1024 < 1024
                              ? `${Math.round((selectedFile?.size || 0) / 1024)} KB`
                              : `${Math.round((selectedFile?.size || 0) / 1024 / 1024)} MB`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedFile?.type || "Unknown type"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={handleRemoveFile}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedSubject || !selectedFile || isUploading}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload File</span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSubject && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Uploaded Files</CardTitle>
            <CardDescription>
              Files you've uploaded for {selectedSubject} ({uploadType})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Select a subject and type to view your uploaded files
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}