"use client";
import "rsuite/dist/rsuite.min.css";

import React, { useState } from "react";
import { Uploader, Message, Loader, useToaster } from "rsuite";
import AvatarIcon from "@rsuite/icons/legacy/Avatar";

function FileUpload({ setFilePreview, filePreview, setFile }) {
  const toaster = useToaster();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);

    try {
      setFilePreview(URL.createObjectURL(file));
      setFile(file);
    } catch (error) {
      setFilePreview(null);
      toaster.push(<Message type="error">Upload failed</Message>);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Uploader
      fileListVisible={false}
      listType="picture"
      autoUpload={false} // We handle upload manually
      action=""
      onChange={(fileList) => {
        if (fileList.length > 0) {
          handleUpload(fileList[0].blobFile);
        }
      }}
    >
      <button style={{ width: 150, height: 150 }}>
        {uploading && <Loader backdrop center />}
        {filePreview ? (
          <img src={filePreview} width="100%" height="100%" />
        ) : (
          <AvatarIcon style={{ fontSize: 80 }} />
        )}
      </button>
    </Uploader>
  );
}

export default FileUpload;
