'use client';

interface ProjetoInfoBlocoProps {
  projectName?: string;
  responsibleName?: string;
  responsibleEmail?: string;
  legalRepresentativeName?: string;
  legalRepresentativeEmail?: string;
}

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <p className="text-blue-fcsn dark:text-white-off text-base sm:text-lg">
    <span className="font-bold">{label}:</span> {value || 'Não informado'}
  </p>
);

export default function ProjetoInfoBloco({
  projectName,
  responsibleName,
  responsibleEmail,
  legalRepresentativeName,
  legalRepresentativeEmail,
}: ProjetoInfoBlocoProps) {
  return (
    <div className="flex flex-col justify-center items-start max-w-[1500px] w-[90vw] sm:w-[80vw] xl:w-[70vw] mb-8 p-6 bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-fcsn dark:text-white-off mb-4">
        Informações do projeto
      </h2>
      <div className="space-y-2">
        <InfoRow label="Nome do projeto" value={projectName} />
        <InfoRow label="Responsável pelo projeto" value={responsibleName} />
        <InfoRow label="E-mail do responsável" value={responsibleEmail} />
        <InfoRow label="Representante legal" value={legalRepresentativeName} />
        <InfoRow label="E-mail do representante legal" value={legalRepresentativeEmail} />
      </div>
    </div>
  );
}