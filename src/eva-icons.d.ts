declare module "eva-icons" {
  interface EvaIcon {
    name: string;
    contents: string;
  }

  const eva: {
    icons: Record<string, EvaIcon>;
    replace: (options?: Record<string, unknown>) => void;
  };

  export default eva;
}
