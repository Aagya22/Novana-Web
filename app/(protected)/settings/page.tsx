import UpdateUserForm from "./components/updateform";
import { handleWhoAmI } from "@/lib/actions/auth-action";

export const metadata = {
  title: "Settings - Profile",
};

export default async function SettingsPage() {
  const result = await handleWhoAmI();

  const user = result.success ? result.data : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your profile and account details</p>
        </header>

        <main className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          {user ? (
            <UpdateUserForm user={user} />
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">Unable to load profile.</div>
          )}
        </main>
      </div>
    </div>
  );
}
