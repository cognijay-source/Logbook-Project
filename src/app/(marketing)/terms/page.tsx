export const metadata = {
  title: 'Terms of Use — CrossCheck',
  description: 'CrossCheck terms of use and disclaimer.',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-white">
        CrossCheck — Terms of Use
      </h1>

      <div className="space-y-6 text-[#c0c0cc]">
        <p>
          CrossCheck is a digital record-keeping and tracking tool for personal
          pilot use.
        </p>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            CrossCheck does NOT:
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Generate endorsements or instructor signoffs</li>
            <li>Produce legally binding documents</li>
            <li>Interface with IACRA or any FAA system</li>
            <li>Serve as a substitute for regulatory knowledge</li>
            <li>
              Guarantee the accuracy of currency calculations, goal tracking, or
              time summaries
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            The pilot in command bears full responsibility for:
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>The accuracy of all flight records entered</li>
            <li>Verifying currency status before acting as PIC</li>
            <li>
              Confirming aeronautical experience requirements with their
              instructor and examiner
            </li>
            <li>
              Compliance with all applicable Federal Aviation Regulations
            </li>
          </ul>
        </section>

        <p>
          Digital logbooks are accepted by the FAA per Advisory Circular AC
          120-78A. However, pilots should maintain backup records and be prepared
          to produce logbook data upon request by the FAA.
        </p>

        <p>
          CrossCheck is provided &ldquo;as is&rdquo; without warranty. Use at
          your own risk.
        </p>

        <p className="pt-4 text-sm text-[#6b6b7b]">
          &copy; 2026 CrossCheck. All rights reserved.
        </p>
      </div>
    </div>
  )
}
