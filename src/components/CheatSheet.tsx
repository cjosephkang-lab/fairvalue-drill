import { cheatSheet } from "../data/cheatsheet";

export function CheatSheet() {
  return (
    <article className="mx-auto max-w-xl px-4 pb-8 pt-5">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-black/25">
        <div className="border-b border-white/10 bg-slate-900 px-5 py-4">
          <h2 className="text-2xl font-bold leading-tight text-white">
            {cheatSheet.title}
          </h2>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-4">
            <h3 className="text-base font-bold text-cyan-100">核心の公式</h3>
            <div className="mt-2 space-y-1">
              {cheatSheet.formulas.map((f) => (
                <p key={f} className="text-base font-bold leading-7 text-white">
                  {f}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">3ステップ</h3>
            <div className="mt-2 space-y-2">
              {cheatSheet.steps.map((s) => (
                <div
                  key={s.no}
                  className="rounded-lg border border-white/10 bg-[#111827] p-3"
                >
                  <p className="text-base font-bold text-cyan-100">
                    {s.no} {s.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">72の法則 早見表</h3>
            <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-left text-base">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="px-4 py-2 font-bold">利回り</th>
                    <th className="px-4 py-2 font-bold">回収年数</th>
                  </tr>
                </thead>
                <tbody>
                  {cheatSheet.rateTable.map((row) => (
                    <tr
                      key={row.rate}
                      className="border-t border-white/10 text-slate-100"
                    >
                      <td className="px-4 py-2">{row.rate}</td>
                      <td className="px-4 py-2 font-bold">
                        {row.years}
                        {row.star ? (
                          <span className="ml-1 text-amber-200">★</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {cheatSheet.sections.map((sec) => (
            <section
              key={sec.heading}
              className="rounded-lg border border-white/10 bg-slate-900 p-4"
            >
              <h3 className="text-base font-bold text-white">{sec.heading}</h3>
              <ul className="mt-2 space-y-1">
                {sec.lines.map((line) => (
                  <li key={line} className="text-sm leading-6 text-slate-200">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-lg border border-amber-200/30 bg-amber-200/10 p-4">
            <p className="text-center text-base font-bold leading-7 text-amber-100">
              {cheatSheet.oneLiner}
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
