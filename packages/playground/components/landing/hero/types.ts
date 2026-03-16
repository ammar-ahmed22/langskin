export type HeroCodeWindowProps = {
  id: string;
  code: string;
  specString: string;
  visible: boolean;
  maxSpecLines?: number;
};

export type HeroProps = {
  ids: string[];
  phrasesById: Record<string, string>;
  codeMap: Record<string, string>;
  specMap: Record<string, string>;
};
