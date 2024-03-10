import { useState } from "react";
import { useValidateHandle } from "@lens-protocol/react-web";
import { useAccount, useSignMessage } from "wagmi";
import { LensClient, development, isRelaySuccess } from "@lens-protocol/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
type CreateProfileFormProps = {
  wallet: string;
};
const lensClient = new LensClient({
  environment: development,
});
export function UpdateProfileMetadataForm() {
  const { address } = useAccount();

  const [metadataUri, setMetadataUri] = useState("");
  const { execute: validateHandle, loading: verifying } = useValidateHandle();

  const submit = async (e) => {
    e.preventDefault();
    if (!address) return;

    const result = await lensClient.publication.postOnchain({
      contentURI: metadataUri, // ipfs://Qm... or arweave
    });

    console.log(result);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5  max-w-xs ">
      <h3 className="text-xl mb-5">Update Profile Metadata</h3>
      <p>Enter your Metadata uri below. </p>
      <input
        type="text"
        disabled={verifying}
        value={metadataUri}
        className="p-3"
        placeholder="ipfs://Qm... // or arweave"
        onChange={(e) => setMetadataUri(e.target.value)}
      />

      <Button type="submit" disabled={verifying}>
        Update Profile
      </Button>
    </form>
  );
}
