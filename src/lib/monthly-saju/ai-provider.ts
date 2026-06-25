export interface AiProviderOption {
  id: string;
  label: string;
}

export interface AiProviderRegistry {
  defaultProvider: AiProviderOption;
  providers: AiProviderOption[];
}

export function createAiProviderRegistry(
  providers: AiProviderOption[],
): AiProviderRegistry {
  if (providers.length === 0) {
    throw new Error("At least one AI provider is required");
  }

  return {
    defaultProvider: providers[0],
    providers,
  };
}

export function chooseAiProvider(
  registry: AiProviderRegistry,
  selectedProviderId?: string,
): AiProviderOption {
  return (
    registry.providers.find((provider) => provider.id === selectedProviderId) ??
    registry.defaultProvider
  );
}

