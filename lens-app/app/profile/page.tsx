"use client";
import {
  ChangeProfileManagerActionType,
  Eip712TypedDataDomainFragment,
  LensClient,
  ProfileFragment,
  development,
  isRelaySuccess,
} from "@lens-protocol/client";
import React from "react";
import { useAccount, useSignMessage, useSignTypedData } from "wagmi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreatePostForm } from "../../components/forms/create-post-form";
import { signedTypeData } from "@/lib/ethers.service";
const lensClient = new LensClient({
  environment: development,
});

export default function ProfileWrapper() {
  const { address } = useAccount();

  if (!address) return null;

  return <Profile address={address} />;
}

function Profile({ address }) {
  const [profile, setProfile] = React.useState<ProfileFragment | null>(null);
  const [isProfileManagerEnabled, setIsProfileManagerEnabled] =
    React.useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync, signTypedData } = useSignTypedData();

  const authenticateUser = async () => {
    if (!address || !profile) return;

    const { id, text } = await lensClient.authentication.generateChallenge({
      signedBy: address, // e.g "0xdfd7D26fd33473F475b57556118F8251464a24eb"
      for: profile?.id, // e.g "0x01"
    });

    const signature = await signMessageAsync({ message: text });

    console.log(id, signature);
    const auth = await lensClient.authentication.authenticate({
      id, // returned from authentication.generateChallenge
      signature,
    });
    await checkAuth();
  };

  const checkAuth = async () => {
    const profileId = await lensClient.authentication.getProfileId();
    const isAuthenticated = await lensClient.authentication.isAuthenticated();
    if (isAuthenticated) {
      setIsAuthenticated(true);
    } else {
      await authenticateUser();
    }
    console.log(profileId, isAuthenticated);
  };

  async function getManagedProfiles() {
    if (!address) return;

    const managedProfiles = await lensClient.wallet.profilesManaged({
      for: address,
    });
    if (managedProfiles.items.length) {
      setProfile(managedProfiles.items[0]);
      setIsProfileManagerEnabled(managedProfiles.items[0].signless);
    }
  }

  const handleUpdateProfileManager = async () => {
    try {
      const isAuth = await lensClient.profile.fetch({
        forProfileId: profile?.id!,
      });

      console.log(isAuth);

      if (isAuth?.signless) {
        console.log("Profile manager is enabled");
        const mprofileMAnagerUpdateResponse =
          await lensClient.profile.createChangeProfileManagersTypedData({
            approveSignless: false,
          });
        console.log(mprofileMAnagerUpdateResponse);

        // setIsProfileManagerEnabled(false);
      } else {
        await authenticateUser();
        const typedDataResult =
          await lensClient.profile.createChangeProfileManagersTypedData({
            approveSignless: true,
            // changeManagers: [
            //   {
            //     action: ChangeProfileManagerActionType.Add,
            //     address: address,
            //   },
            // ],
          });

        const { id, typedData } = typedDataResult.unwrap();

        const signature = await signedTypeData(
          typedData.domain,
          typedData.types,
          typedData.value
        );
        console.log("change profile manager: signature", signature);

        // // sign with the wallet
        // const signedTypedData = await signTypedDataAsync({
        //   domain: {
        //     name: typedData.domain.name,
        //     version: typedData.domain.version,
        //     chainId: typedData.domain.chainId,
        //     verifyingContract: typedData.domain
        //       .verifyingContract as `0x${string}`,
        //   },
        //   types: typedData.types,
        //   primaryType: "EIP712Domain", // Add the missing primaryType property
        //   message: {}, // Add the missing message property
        // });

        // const signedTypedData = await signTypedDataAsync({
        //   ...typedData,
        //   primaryType: "EIP712Domain",
        //   message: {}, // Add the missing message property
        //   domain: {
        //     ...typedData.domain,
        //     verifyingContract: typedData.domain
        //       .verifyingContract as `0x${string}`,
        //   },
        // });
        // console.log(signedTypedData);

        // // broadcast onchain
        const broadcastOnchainResult =
          await lensClient.transaction.broadcastOnchain({
            id,
            signature: signature,
          });

        console.log(broadcastOnchainResult);

        const onchainRelayResult = broadcastOnchainResult.unwrap();

        if (onchainRelayResult.__typename === "RelayError") {
          console.log(`Something went wrong`);
          return;
        }

        console.log(
          `Successfully changed profile managers with transaction with id ${onchainRelayResult}, txHash: ${onchainRelayResult.txHash}`
        );

        setIsProfileManagerEnabled(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfileDetails = async () => {
    if (!profile) return console.log("profilenot found");
    const prfile = await lensClient.profile.fetch({
      forProfileId: profile?.id!,
    });

    // console.log(prfile);

    if (prfile?.signless) {
      console.log("Profile manager is enabled");
    } else {
      console.log("Profile manager is disabled");
    }
  };

  useEffect(() => {
    (async function () {
      await getManagedProfiles();
      await checkAuth();
      await updateProfileDetails();
    })();

    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    (async function () {
      await checkAuth();
      await getManagedProfiles();
      await updateProfileDetails();
    })();

    //eslint-disable-next-line
  }, [isAuthenticated, isProfileManagerEnabled]);

  if (!profile) {
    return (
      <div className="p-10">
        <CreateProfilePlaceHolder />
      </div>
    );
  }

  // console.log(new Date().toISOString());

  return (
    <main className="px-10 py-14  ">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-xl mb-5">Profile</h3>
          <a
            rel="no-opener"
            target="_blank"
            href={`https://share.lens.xyz/u/${profile.handle?.localName}.${profile.handle?.namespace}`}
          >
            <div className="border rounded-lg p-10">
              <div>
                {profile?.metadata?.picture?.__typename! === "ImageSet" && (
                  <Image
                    width={500}
                    height={500}
                    alt="Profile Picture"
                    src={
                      profile?.metadata?.picture?.__typename === "ImageSet"
                        ? profile?.metadata?.picture?.optimized?.uri!
                        : ""
                    }
                    className="rounded w-[200px]"
                  />
                )}
              </div>
              <div className="mt-4">
                <p className="text-lg">{profile?.metadata?.displayName}</p>
                <p className="text-muted-foreground font-medium">
                  @{profile?.handle?.localName}.{profile?.handle?.namespace}
                </p>
              </div>
            </div>
          </a>
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg  p-4">
          <div className="space-y-0.5">
            <label className="text-base">Profile Manager</label>
            <p className="text-xs text-gray-500">
              Enable profile Manager to update Metadata.
            </p>
          </div>
          <div>
            <AlertDialog>
              <AlertDialogTrigger>
                <Switch
                  checked={isProfileManagerEnabled}
                  // onCheckedChange={handleChange}
                  aria-readonly
                />
              </AlertDialogTrigger>
              {isProfileManagerEnabled ? (
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are yous sure ?.</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be asked to sign a message to disable Profile
                      Manager.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdateProfileManager}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              ) : (
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Enabling Profile Manager Requires Authentication.
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be asked to sign a message to enable Profile
                      Manager.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdateProfileManager}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              )}
            </AlertDialog>
          </div>
        </div>

        {/* <div className="py-5">
          <Button onClick={updateProfileDetails}>Get profile Details</Button>
        </div> */}
        <div className="space-y-5">
          {!isAuthenticated && (
            <div className="py-5">
              <Button onClick={checkAuth}>Check auth</Button>
            </div>
          )}
          {isAuthenticated && <CreatePostForm lensClient={lensClient} />}
        </div>
      </div>
    </main>
  );
}

function CreateProfilePlaceHolder() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="11" r="1" />
          <path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5ZM8 14a5 5 0 1 1 8 0" />
          <path d="M17 18.5a9 9 0 1 0-10 0" />
        </svg>

        <h3 className="mt-4 text-lg font-semibold">
          You don&apos;t have a profile yet.
        </h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Get started by creating a new profile.
        </p>
        <Link href="/create-profile">
          <Button>Create Profile</Button>
        </Link>
      </div>
    </div>
  );
}
