import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';

const Information = () => {
  return (
    <div className="history-page">
      <div className="history-card">
        <h2 className="history-title">Informasi Barang Keluar</h2>

        <Table>
          <THead>
            <TR>
              <TH style={{ width: '52px' }}>No</TH>
              <TH>Tanggal</TH>
              <TH>Nama Barang</TH>
              <TH>Kode Barang</TH>
              <TH>Jumlah</TH>
              <TH>Satuan</TH>
              <TH>Penerima</TH>
              <TH>Unit</TH>
              <TH>Status</TH>
              <TH>Keterangan</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TD colSpan={10} className="empty-row">Tidak ada data permintaan barang keluar</TD>
            </TR>
          </TBody>
        </Table>
      </div>
    </div>
  );
};

export default Information;
