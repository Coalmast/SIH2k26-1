import React from 'react';
import { View, StyleSheet, Document, Page } from "@/lib/pdf-primitives";
import { Text } from "@/components/pdf/text/text";
import { Section } from "@/components/pdf/section/section";
import { KeyValue } from "@/components/pdf/key-value/key-value";
import { PageHeader } from "@/components/pdf/page-header/page-header";
import { PageFooter } from "@/components/pdf/page-footer/page-footer";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/pdf/table/table";
import { Signature } from "@/components/pdf/signature/signature";
import { PdfcnThemeProvider, usePdfcnTheme } from "@/components/pdf/theme-provider";

export interface Form3Data {
  mineName: string;
  ownerCompany: string;
  reportingPeriod: { start: string; end: string };
  totalProductionMT: number;
  totalWorkers: number;
  accidents: { fatal: number; serious: number; };
  ventilationSurveys: number;
  safetyCommitteeMeetings: number;
  managerName: string;
  signatureDataUrl?: string;
  signedAt?: string;
}

const Form3Content = ({ data }: { data: Form3Data }) => {
  const theme = usePdfcnTheme();

  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      padding: theme.spacing.page.marginTop,
      paddingBottom: theme.spacing.page.marginBottom,
      position: "relative",
    },
    highlightedField: {
      backgroundColor: 'rgba(252, 213, 53, 0.2)', // COMET highlightAmber
      borderRadius: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      borderBottomStyle: 'solid',
      paddingBottom: 4,
      marginBottom: 10,
    }
  });

  return (
    <Document title={`Form 3 Annual Return - ${data.mineName}`}>
      <Page size="A4" style={styles.page}>
        <PageHeader 
          title="FORM III - ANNUAL RETURN" 
          subtitle="See Regulation 4(1) of Metalliferous Mines Regulations, 1961" 
        />

        <Text style={styles.title}>Annual Return for the year ending {data.reportingPeriod.end}</Text>

        <Section style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>1. Mine Identification</Text>
          <KeyValue 
            items={[
              { key: "Name of Mine", value: data.mineName, valueStyle: styles.highlightedField },
              { key: "Owner Company", value: data.ownerCompany, valueStyle: styles.highlightedField },
              { key: "Reporting Period", value: `${data.reportingPeriod.start} to ${data.reportingPeriod.end}` }
            ]} 
          />
        </Section>

        <Section style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>2. Production & Employment</Text>
          <Table>
            <TableHeader>
              <TableRow header>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total Production (Metric Tonnes)</TableCell>
                <TableCell align="right" style={styles.highlightedField}>{data.totalProductionMT.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Average Daily Employment (Total Workers)</TableCell>
                <TableCell align="right" style={styles.highlightedField}>{data.totalWorkers.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>3. Safety & Compliance Record</Text>
          <KeyValue 
            items={[
              { key: "Fatal Accidents", value: data.accidents.fatal.toString(), valueStyle: styles.highlightedField },
              { key: "Serious Accidents", value: data.accidents.serious.toString(), valueStyle: styles.highlightedField },
              { key: "Ventilation Surveys Conducted", value: data.ventilationSurveys.toString() },
              { key: "Safety Committee Meetings Held", value: data.safetyCommitteeMeetings.toString() }
            ]} 
          />
        </Section>

        <Section noWrap style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}>4. Declaration</Text>
          <Text>
            I certify that the information given above is true and correct to the best of my knowledge and belief.
          </Text>
          
          <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Signature 
              name={data.managerName}
              title="Mine Manager"
              date={data.signedAt || "Draft (Unsigned)"}
              signatureImage={data.signatureDataUrl}
            />
          </View>
        </Section>

        <PageFooter 
          leftText={`Generated by COMET Compliance Platform`} 
          rightText="Page 1 of 1"
          sticky 
        />
      </Page>
    </Document>
  );
};

export const Form3AnnualReturn = ({ data }: { data: Form3Data }) => (
  <PdfcnThemeProvider>
    <Form3Content data={data} />
  </PdfcnThemeProvider>
);
