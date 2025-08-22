const CHUNK_SIZE = 1000;

export const saveRecordsToStorage = (data, tokenMeta, projectId) => {
  try {
    const metadata = {
      totalRecords: data.length,
      tokenMeta,
      chunks: Math.ceil(data.length / CHUNK_SIZE),
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(
      `mdsRecordsMeta_${projectId}`,
      JSON.stringify(metadata)
    );

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      localStorage.setItem(
        `mdsRecordsData_${projectId}_chunk_${i / CHUNK_SIZE}`,
        JSON.stringify(chunk)
      );
    }

    return true;
  } catch (error) {
    console.error("Error saving records to localStorage:", error);
    return false;
  }
};

export const getRecordsFromStorage = (currentToken, projectId) => {
  try {
    const metadataStr = localStorage.getItem(`mdsRecordsMeta_${projectId}`);
    if (!metadataStr) return { success: false };

    const metadata = JSON.parse(metadataStr);
    if (metadata.tokenMeta.token !== currentToken) return { success: false };

    const allData = [];
    for (let i = 0; i < metadata.chunks; i++) {
      const chunkStr = localStorage.getItem(
        `mdsRecordsData_${projectId}_chunk_${i}`
      );
      if (chunkStr) {
        allData.push(...JSON.parse(chunkStr));
      }
    }

    return {
      data: allData,
      tokenMeta: metadata.tokenMeta,
      success: true,
    };
  } catch (error) {
    console.error("Error retrieving records from localStorage:", error);
    return { success: false, error };
  }
};
