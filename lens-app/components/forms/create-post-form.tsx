import { useState } from "react";
import { useValidateHandle } from "@lens-protocol/react-web";
import { useAccount, useSignMessage } from "wagmi";
import { LensClient, development, isRelaySuccess } from "@lens-protocol/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { textOnly } from "@lens-protocol/metadata";
type CreateProfileFormProps = {
  wallet: string;
};

export function CreatePostForm({ lensClient }: { lensClient: LensClient }) {
  const { address } = useAccount();

  const [metadataUri, setMetadataUri] = useState("");
  const { execute: validateHandle, loading: verifying } = useValidateHandle();

  const submit = async (e) => {
    e.preventDefault();
    if (!address) return;

    const metadata = textOnly({
      content: "GM!",
    });

    console.log(metadata);

    const result = await lensClient.publication.postOnchain({
      contentURI: metadataUri, // ipfs://Qm... or arweave
    });

    console.log(result);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5  max-w-xs ">
      <h3 className="text-xl mb-5">Create Post</h3>
      <p>Enter your post Metadata uri below. </p>
      <input
        type="text"
        disabled={verifying}
        value={metadataUri}
        className="p-3"
        placeholder="ipfs://Qm... // or arweave"
        onChange={(e) => setMetadataUri(e.target.value)}
      />

      <Button type="submit" disabled={verifying}>
        Create Post
      </Button>
    </form>
  );
}
