import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext} from "expo-sqlite";
import { initializeDB } from "@/db/db";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

export default function RootLayout() {
  
  return (
    <SQLiteProvider databaseName="forestAve.db" onInit={initializeDB}>
      <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SQLiteProvider>
  );
}
