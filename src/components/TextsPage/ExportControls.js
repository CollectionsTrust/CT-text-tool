import { useParams } from "react-router-dom";
import {
  exportToCsv,
  exportToCsvTwoFiles,
  exportToXml,
  exportToJson,
  exportToHtml,
} from "../TextsPage/utils/exports";
import { useProjectForm } from "../ProjectSetup/hooks/useProjectForm";

const ExportControls = ({ texts }) => {
  const { projectId } = useParams();
  const { formData, selectedLanguages, assignedAuthors } =
    useProjectForm(projectId);

  const handleExport = (type) => {
    const projectInfo = {
      id: projectId,
      ...formData,
      languages: selectedLanguages,
      authors: assignedAuthors.map((author) => author.name),
      settings: {
        hasHierarchicalText: formData.hasHierarchicalText || false,
        tracksTextStatus: formData.tracksTextStatus || false,
        wantsTextTags: formData.wantsTextTags || false,
        doNotSaveAuthorNames: formData.doNotSaveAuthorNames || false,
        textStatuses: formData.textStatuses || [],
        textTags: formData.textTags || [],
        languages: selectedLanguages || [],
      },
    };

    switch (type) {
      case "csv":
        exportToCsv(texts, projectInfo);
        break;
      case "csv-two-files":
        exportToCsvTwoFiles(texts, projectInfo, projectInfo.settings);
        break;
      case "xml":
        exportToXml(texts, projectInfo);
        break;
      case "json":
        exportToJson(texts, projectInfo, projectInfo.settings);
        break;
      case "html":
        exportToHtml(texts, projectInfo);
        break;
      default:
        console.warn(`Unsupported export type: ${type}`);
    }
  };

  return (
    <div className="export-controls">
      <button onClick={() => handleExport("csv")}>Export CSV</button>
      <button onClick={() => handleExport("csv-two-files")}>
        Export CSV - 2 files
      </button>
      <button onClick={() => handleExport("xml")}>Export XML</button>
      <button onClick={() => handleExport("json")}>Export JSON</button>
      <button onClick={() => handleExport("html")}>Export HTML</button>
    </div>
  );
};

export default ExportControls;
