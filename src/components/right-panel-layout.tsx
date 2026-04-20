export function RightPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-4 lg:max-w-none lg:px-6">
        <div className="lg:flex lg:justify-center">
          <div className="w-full lg:w-[50%] lg:min-w-[420px] lg:max-w-[640px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
