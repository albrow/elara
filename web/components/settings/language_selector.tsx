/**
 * Language Selector Component
 * Allows users to change the application language
 */

import { Box, Select, Text, HStack, Icon } from "@chakra-ui/react";
import { MdLanguage } from "react-icons/md";
import { useTranslation } from "../../contexts/i18n";

interface LanguageSelectorProps {
  /** Whether to show the label */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export default function LanguageSelector({
  showLabel = true,
  size = "md",
}: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales, t } = useTranslation();

  return (
    <Box>
      {showLabel && (
        <HStack mb={2}>
          <Icon as={MdLanguage} />
          <Text fontWeight="medium">{t("settings.language")}</Text>
        </HStack>
      )}
      <Select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        size={size}
        maxW="200px"
      >
        {availableLocales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.nativeName}
          </option>
        ))}
      </Select>
    </Box>
  );
}
