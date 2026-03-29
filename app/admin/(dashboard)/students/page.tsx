import { prisma } from "@/lib/prisma";
import { CreateStudentDialog } from "./_components/create-student-dialog";
import { ImportCsvDialog } from "./_components/import-csv-dialog";
import { DeleteStudentButton } from "./_components/delete-student-button";
import { EditSectionsDialog } from "./_components/edit-sections-dialog";

type StudentRow = {
  id: string;
  student_id: string;
  full_name: string;
  sections: Array<{ section: { id: number; name: string } }>;
};

export default async function StudentsPage() {
  const [students, sections] = await Promise.all([
    prisma.student.findMany({
      include: { sections: { include: { section: true } } },
      orderBy: { created_at: "desc" },
    }) as Promise<StudentRow[]>,
    prisma.section.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students ({students.length})</h1>
        <div className="flex gap-2">
          <CreateStudentDialog sections={sections} />
          <ImportCsvDialog sections={sections} />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b">
              <th className="text-left px-4 py-3 font-medium">รหัสนักศึกษา</th>
              <th className="text-left px-4 py-3 font-medium">ชื่อ-นามสกุล</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                กลุ่ม (Section)
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  ยังไม่มีนักศึกษา — เพิ่มรายบุคคลหรือ Import CSV
                </td>
              </tr>
            )}
            {students.map((student: StudentRow) => (
              <tr
                key={student.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-mono text-sm">
                  {student.student_id}
                </td>
                <td className="px-4 py-3 font-medium">{student.full_name}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {student.sections.length > 0
                        ? student.sections
                            .map((ss) => ss.section.name)
                            .join(", ")
                        : "—"}
                    </span>
                    <EditSectionsDialog
                      studentId={student.id}
                      studentName={student.full_name}
                      currentSectionIds={student.sections.map(
                        (ss) => ss.section.id,
                      )}
                      sections={sections}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteStudentButton studentId={student.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
