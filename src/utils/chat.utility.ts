export const getTime = (date: Date): string => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

export const handleError = async (response: Response): Promise<string> => {
  if (typeof response.json === 'function') {
    const content = await response.json();
    if (content.detail) {
      try {
        const detail = JSON.parse(content.detail);
        if (detail.message) {
          return detail.message;
        } else {
          return detail.toString();
        }
      }
      catch (error) {
        return content.detail.toString();
      }
    } else if (content.message) {
      return content.message;
    } else {
      return content.toString();
    }
  } else {
    return response.statusText;
  }
}
