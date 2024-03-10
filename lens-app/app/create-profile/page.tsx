"use client";
import { Button } from "@/components/ui/button";
import { LensClient, development, isRelaySuccess } from "@lens-protocol/client";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import React from "react";
import { useAccount, useSignMessage } from "wagmi";
import { CreateProfileForm } from "../../components/forms/create-profile-form";

const lensClient = new LensClient({
  environment: development,
});

export default function CreateProfile() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [profileId, setProfileId] = React.useState<string | null>(null);

  const { open } = useWeb3Modal();

  const createNewProfile = async () => {
    const handle = Date.now().toString();

    if (!address) return;

    // console.log(
    //   `Creating a new profile for ${address} with handle "${handle}"`
    // );

    // const profileCreateResult = await lensClient.wallet.createProfileWithHandle(
    //   {
    //     handle: handle,
    //     to: address,
    //   }
    // );

    // if (isRelaySuccess(profileCreateResult)) {
    //   console.log(
    //     `Transaction to create a new profile with handle "${handle}" was successfully broadcasted with txId ${profileCreateResult.txId}`
    //   );
    // }

    const allOwnedProfiles = await lensClient.profile.fetchAll({
      where: {
        ownedBy: [address],
      },
    });

    console.log(allOwnedProfiles);

    console.log(
      `All owned profiles: `,
      allOwnedProfiles.items.map((i) => ({ id: i.id, handle: i.handle }))
    );

    const newProfile = allOwnedProfiles.items.find(
      (item) => `${item.handle}` === `${handle}.test`
    );

    if (newProfile) {
      console.log(`The newly created profile's id is: ${newProfile.id}`);
    }
  };

  const getProfileDetails = async () => {
    const profile = await lensClient.profile.fetch({
      forProfileId: "0x0875",
    });

    if (profile?.signless) {
      console.log("Profile manager is enabled");
    } else {
      console.log("Profile manager is disabled");
    }
  };

  const updateProfileDetails = async () => {
    const typedDataResult =
      await lensClient.profile.createChangeProfileManagersTypedData({
        approveSignless: true, // or false to disable
        // leave blank if you want to use the lens API dispatcher!
        // changeManagers: [
        //   {
        //     action: ChangeProfileManagerActionType.Add,
        //     address: '0xEEA0C1f5ab0159dba749Dc0BAee462E5e293daaF',
        //   },
        // ],
      });

    console.log("typedDataResult", typedDataResult);
  };

  const authenticateUser = async () => {
    if (!address) return;
    const managedProfiles = await lensClient.wallet.profilesManaged({
      for: address,
    });

    const profileId = managedProfiles.items[0].id;
    const { id, text } = await lensClient.authentication.generateChallenge({
      signedBy: address, // e.g "0xdfd7D26fd33473F475b57556118F8251464a24eb"
      for: profileId, // e.g "0x01"
    });

    const signature = await signMessageAsync({ message: text });
    await lensClient.authentication.authenticate({
      id, // returned from authentication.generateChallenge
      signature,
    });

    console.log("id", id, "_____________________________");
    console.log("text", text, "_____________________________");
    console.log("signature", signature, "_____________________________");
  };

  const getManagedProfiles = async () => {
    if (!address) return;
    const managedProfiles = await lensClient.wallet.profilesManaged({
      for: address,
    });
    console.log(managedProfiles);
  };
  return (
    <main className="px-10 py-14">
      <div>
        <CreateProfileForm />
      </div>
      {/* <div className="py-5">
        <Button onClick={authenticateUser}>Authenticate</Button>
      </div>
      <div className="py-5">
        <Button onClick={createNewProfile}>Create a new profile</Button>
      </div>
      <div className="py-5">
        <Button onClick={getProfileDetails}>Get profile Details</Button>
      </div>
      <div className="py-5">
        <Button onClick={updateProfileDetails}>update profile</Button>
      </div>
      <div className="py-5">
        <Button onClick={getManagedProfiles}>get managed profile</Button>
      </div> */}
    </main>
  );
}
