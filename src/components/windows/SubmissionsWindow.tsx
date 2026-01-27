import React from 'react';
import { useData } from '../../contexts/DataContext';

export function SubmissionsWindow() {
  const { submissions } = useData();

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Accepted': return 'xp-status-accepted';
      case 'Wrong Answer': return 'xp-status-rejected';
      case 'Pending': return 'xp-status-pending';
      default: return 'xp-status-rejected';
    }
  };

  return (
    <div className="h-full">
      <div className="xp-panel-inset h-full overflow-auto xp-scroll">
        <table className="xp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Problem</th>
              <th style={{ width: '100px' }}>Language</th>
              <th style={{ width: '140px' }}>Status</th>
              <th style={{ width: '140px' }}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted-foreground py-4">
                  No submissions yet. Solve some problems!
                </td>
              </tr>
            ) : (
              submissions.map((submission, index) => (
                <tr key={submission.id}>
                  <td>{submissions.length - index}</td>
                  <td>{submission.problemTitle}</td>
                  <td>{submission.language}</td>
                  <td className={getStatusClass(submission.status)}>
                    {submission.status}
                  </td>
                  <td className="text-xs">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
