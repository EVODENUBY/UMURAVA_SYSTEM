import pdf from 'pdf-parse';
import { parse } from 'csv-parse/sync';
import logger from '../utils/logger';

export interface ParsedResume {
  text: string;
  metadata?: {
    pages?: number;
    info?: Record<string, unknown>;
  };
}

export interface ParsedCSVRecord {
  name: string;
  email: string;
  phone?: string;
  skills: string;
  experience: string;
  education: string;
  resumeText?: string;
  [key: string]: string | undefined;
}

export interface CSVParseResult {
  records: ParsedCSVRecord[];
  totalRows: number;
  successfulParses: number;
  errors: Array<{ row: number; error: string }>;
}

export class ParserService {
  /**
   * Parse a PDF resume buffer to extract text
   */
  async parsePDF(buffer: Buffer): Promise<ParsedResume> {
    try {
      logger.info('Parsing PDF resume', { bufferSize: buffer.length });

      const data = await pdf(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF contains no extractable text');
      }

      logger.info('PDF parsed successfully', { 
        pages: data.numpages, 
        textLength: data.text.length 
      });

      return {
        text: data.text.trim(),
        metadata: {
          pages: data.numpages,
          info: data.info as Record<string, unknown>
        }
      };
    } catch (error) {
      logger.error('Error parsing PDF:', error);
      throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse CSV file buffer containing applicant data
   */
  parseCSV(buffer: Buffer, options: {
    delimiter?: string;
    skipEmptyLines?: boolean;
    columns?: boolean | string[];
  } = {}): CSVParseResult {
    try {
      logger.info('Parsing CSV file', { bufferSize: buffer.length });

      const defaultOptions = {
        delimiter: options.delimiter || ',',
        skip_empty_lines: options.skipEmptyLines !== false,
        columns: options.columns !== false,
        trim: true,
        cast: false
      };

      const records = parse(buffer.toString(), defaultOptions) as Array<Record<string, string>>;
      
      const results: ParsedCSVRecord[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      records.forEach((record, index) => {
        try {
          const normalizedRecord = this.normalizeCSVRecord(record);
          results.push(normalizedRecord);
        } catch (error) {
          errors.push({
            row: index + 2, // +2 because header is row 1 and array is 0-indexed
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      logger.info('CSV parsed successfully', { 
        totalRows: records.length, 
        successfulParses: results.length,
        errors: errors.length 
      });

      return {
        records: results,
        totalRows: records.length,
        successfulParses: results.length,
        errors
      };
    } catch (error) {
      logger.error('Error parsing CSV:', error);
      throw new Error(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Normalize CSV record to standard format
   */
  private normalizeCSVRecord(record: Record<string, string>): ParsedCSVRecord {
    // Map common column names to our standard fields
    const fieldMappings: Record<string, string[]> = {
      name: ['name', 'full_name', 'fullname', 'candidate_name', 'applicant_name', 'first_name', 'last_name'],
      email: ['email', 'email_address', 'e-mail', 'mail', 'contact_email'],
      phone: ['phone', 'phone_number', 'mobile', 'contact_number', 'telephone'],
      skills: ['skills', 'skill_set', 'technical_skills', 'key_skills', 'competencies'],
      experience: ['experience', 'work_experience', 'professional_experience', 'years_of_experience', 'total_experience'],
      education: ['education', 'qualification', 'degree', 'academic_background', 'highest_education'],
      resumeText: ['resume', 'cv', 'profile', 'summary', 'about', 'description', 'bio']
    };

    const normalized: ParsedCSVRecord = {
      name: '',
      email: '',
      skills: '',
      experience: '',
      education: ''
    };

    // Normalize keys to lowercase and trim
    const lowerRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      lowerRecord[key.toLowerCase().trim()] = value?.trim() || '';
    }

    // Map fields using various possible column names
    for (const [standardField, possibleNames] of Object.entries(fieldMappings)) {
      for (const possibleName of possibleNames) {
        if (lowerRecord[possibleName]) {
          normalized[standardField as keyof ParsedCSVRecord] = lowerRecord[possibleName];
          break;
        }
      }
    }

    // Validate required fields
    if (!normalized.name) {
      throw new Error('Name field is required but not found in CSV');
    }

    if (!normalized.email) {
      throw new Error('Email field is required but not found in CSV');
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalized.email)) {
      throw new Error(`Invalid email format: ${normalized.email}`);
    }

    // Combine name fields if separated
    if (!normalized.name && (lowerRecord['first_name'] || lowerRecord['last_name'])) {
      const firstName = lowerRecord['first_name'] || '';
      const lastName = lowerRecord['last_name'] || '';
      normalized.name = `${firstName} ${lastName}`.trim();
    }

    // Include any additional fields
    for (const [key, value] of Object.entries(lowerRecord)) {
      if (!(key in normalized) && value) {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  /**
   * Extract skills from text using common delimiters
   */
  extractSkillsFromText(text: string): string[] {
    if (!text) return [];

    // Common delimiters for skills
    const delimiters = /[,;|\/]+/;
    
    return text
      .split(delimiters)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .filter((skill, index, self) => self.indexOf(skill) === index); // Remove duplicates
  }

  /**
   * Clean and normalize resume text
   */
  cleanResumeText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with parsing
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Trim
      .trim();
  }

  /**
   * Detect file type from buffer
   */
  detectFileType(buffer: Buffer): 'pdf' | 'csv' | 'unknown' {
    // PDF magic number: %PDF
    if (buffer.length > 4 && buffer.slice(0, 4).toString() === '%PDF') {
      return 'pdf';
    }

    // CSV detection - check for common CSV characteristics
    const sample = buffer.slice(0, 1024).toString();
    const hasCSVCharacteristics = 
      sample.includes(',') && 
      (sample.includes('\n') || sample.includes('\r'));
    
    if (hasCSVCharacteristics) {
      return 'csv';
    }

    return 'unknown';
  }

  /**
   * Parse file based on detected type
   */
  async parseFile(buffer: Buffer, mimetype: string): Promise<{
    type: 'pdf' | 'csv';
    data: ParsedResume | CSVParseResult;
  }> {
    const detectedType = this.detectFileType(buffer);

    if (detectedType === 'pdf' || mimetype === 'application/pdf') {
      const data = await this.parsePDF(buffer);
      return { type: 'pdf', data };
    }

    if (detectedType === 'csv' || mimetype === 'text/csv' || mimetype === 'application/csv') {
      const data = this.parseCSV(buffer);
      return { type: 'csv', data };
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

export default new ParserService();
