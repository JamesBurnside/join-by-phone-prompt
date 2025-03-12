import "./App.css";
import {
  CallAdapter,
  CallAdapterState,
  CallComposite,
  CallCompositeOptions,
  ConferencePhoneInfo,
  createAzureCommunicationCallAdapter,
} from "@azure/communication-react";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { useEffect, useRef, useState } from "react";
import { initializeIcons, Spinner } from "@fluentui/react";
import { CallState } from "@azure/communication-calling";
import { JoinByPhoneModal } from "./JoinByPhonePrompt";

initializeIcons();

const USER_ID = import.meta.env.VITE_TEST_USER_ID;
const USER_TOKEN = import.meta.env.VITE_TEST_USER_TOKEN;
const MEETING_LINK = import.meta.env.VITE_TEST_MEETING_LINK;

if (!USER_ID) {
  throw new Error("VITE_TEST_USER_ID is not defined in the `.env` file");
}
if (!USER_TOKEN) {
  throw new Error("VITE_TEST_USER_TOKEN is not defined in the `.env` file");
}
if (!MEETING_LINK) {
  throw new Error("VITE_TEST_MEETING_LINK is not defined in the `.env` file");
}

function App() {
  const [adapter, setAdapter] = useState<CallAdapter | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [showJoinByPhonePrompt, setShowJoinByPhonePrompt] = useState(false);
  const [joinByPhoneDetails, setJoinByPhoneDetails] = useState<
    ConferencePhoneInfo[] | undefined
  >();
  const callConnectionState = useRef<CallState | undefined>(undefined);

  // Create adapter when component mounts
  useEffect(() => {
    const onAdapterStateChange = (state: CallAdapterState) => {
      if (
        state.call?.state === "Connected" &&
        callConnectionState.current !== "Connected"
      ) {
        // Call just connected, check if we should show join by phone prompt
        if (state.devices.microphones.length === 0) {
          // No microphones available, show join by phone prompt
          setShowJoinByPhonePrompt(true);
        }
      }

      callConnectionState.current = state.call?.state;
      setJoinByPhoneDetails(state.call?.meetingConference?.conferencePhones);
    };

    const createAdapterAsync = async (): Promise<CallAdapter | undefined> => {
      try {
        const adapter = await createAdapter();
        setAdapter(adapter);
        adapter.onStateChange(onAdapterStateChange);
        return adapter;
      } catch (e) {
        setError(`Failed to create adapter: ${e}`);
      }
    };

    const adapterCreatePromise = createAdapterAsync();

    return () => {
      adapterCreatePromise.then((adapter) => {
        adapter?.offStateChange(onAdapterStateChange);
        adapter?.dispose();
      });
    };
  }, []);

  const callCompositeOptions: CallCompositeOptions = {
    joinCallOptions: {
      microphoneCheck: "skip",
    },
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {!adapter && !error && (
        <Spinner
          label="Creating adapter..."
          styles={{
            root: {
              height: "100vh",
              width: "100vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
      )}
      {adapter && (
        <CallComposite adapter={adapter} options={callCompositeOptions} />
      )}
      {error && <p>{error}</p>}
      <JoinByPhoneModal
        showModal={showJoinByPhonePrompt}
        onDismiss={() => {
          setShowJoinByPhonePrompt(false);
        }}
        conferencePhoneInfoList={joinByPhoneDetails ?? []}
      />
    </div>
  );
}

const createAdapter = async (): Promise<CallAdapter> => {
  return await createAzureCommunicationCallAdapter({
    userId: {
      communicationUserId: USER_ID,
    },
    displayName: "Test user",
    credential: new AzureCommunicationTokenCredential(USER_TOKEN),
    locator: {
      meetingLink: MEETING_LINK,
    },
  });
};

export default App;
