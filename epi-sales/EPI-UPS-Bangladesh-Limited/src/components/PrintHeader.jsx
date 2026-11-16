// Shared pieces of the A4 print layouts
export function PrintHeader({ title }) {
  return (
    <div className="print-header">
      <h1>EPI UPS (Bangladesh) Limited</h1>
      <h2>{title}</h2>
    </div>
  );
}

export function PrintSignatures() {
  return (
    <div className="print-signatures">
      <div>
        <div className="sig-line"></div>
        <b>MD Habibullah</b>
        <br />
        Engineer, Business Development
      </div>
      <div>
        <div className="sig-line"></div>
        <b>Admin</b>
        <br />
        Name: __________________
        <br />
        Designation: ____________
      </div>
    </div>
  );
}
