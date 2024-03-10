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
export function CreateProfileForm() {
  const { address } = useAccount();

  const [localName, setLocalName] = useState("");
  const { execute: validateHandle, loading: verifying } = useValidateHandle();

  const submit = async (e) => {
    e.preventDefault();
    if (!address) return;

    const profileCreateResult = await lensClient.wallet.createProfileWithHandle(
      {
        handle: localName,
        to: address,
      }
    );

    if (isRelaySuccess(profileCreateResult)) {
      console.log(
        `Transaction to create a new profile with handle "${localName}" was successfully broadcasted with txId ${profileCreateResult.txId}`
      );
    } else {
      return toast("Handle already taken!");
    }
    // console.log(profileCreateResult);

    const allOwnedProfiles = await lensClient.profile.fetchAll({
      where: {
        ownedBy: [address],
      },
    });

    // console.log(allOwnedProfiles);

    console.log(
      `All owned profiles: `,
      allOwnedProfiles.items.map((i) => ({ id: i.id, handle: i.handle }))
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5  max-w-xs ">
      <h3 className="text-xl mb-5">Create Profile</h3>
      <input
        type="text"
        disabled={verifying}
        value={localName}
        className="p-3"
        placeholder="Enter your handle"
        onChange={(e) => setLocalName(e.target.value)}
      />

      <Button type="submit" disabled={verifying}>
        Create
      </Button>
    </form>
  );
}
