import StatusBadge from "../components/StatusBadge";
import { useData } from "../context/DataContext";

const COLUMNS = ["Application ID", "Name", "Phone", "Gender", "City", "State", "Status", "Action"];

export default function AdminApplications() {
  const { applications, issueApplication, rejectApplication } = useData();

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Applications</h1>

      {applications.length === 0 ? (
        <p className="rounded-lg border border-line bg-white p-6 text-muted">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-line bg-surface text-muted">
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c} className="px-4 py-3 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{a.id}</td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.phone}</td>
                  <td className="px-4 py-3">{a.gender}</td>
                  <td className="px-4 py-3">{a.city}</td>
                  <td className="px-4 py-3">{a.state}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    {a.status === "Pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => issueApplication(a.id)} className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark">
                          Issue
                        </button>
                        <button onClick={() => rejectApplication(a.id)} className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
