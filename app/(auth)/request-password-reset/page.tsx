import RequestPasswordResetForm from "../_components/RequestPasswordResetForm";

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{
            background: "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)"
        }}>
            <RequestPasswordResetForm />
        </div>
    );
}