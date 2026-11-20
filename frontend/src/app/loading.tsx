import LoadingScreen from "@/components/loading-screen";

export default function Loading() {
  // You can add any UI specific to the loading state here,
  // or just re-export your existing LoadingScreen component.
  return <LoadingScreen alwaysShow={true} />;
}
