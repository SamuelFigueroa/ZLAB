import gql from 'graphql-tag';

const GET_PRINTER_FORMAT = gql`
  query getPrinterFormat($id: ID!) {
    printerFormat(id: $id) {
      id
      name
      defaults {
        labelWidth
        labelLength
        fieldOrientation
        fieldJustify
        dotsPerMm
        reverse
        mirror
        labelOrientation
      }
      fields {
        name
        variable
        kind
        data
        originX
        originY
        justify
        reverse
        orientation
        fontHeight
        fontWidth
        direction
        gap
        clockEnabled
        clock
        hexEnabled
        hexIndicator

        moduleWidth
        barWidthRatio
        height
        barcode
        checkDigit
        interpretation
        interpretationAbove

        moduleHeight
        columns
        rows
        aspectRatio

        operation
        format

        graphic
        width
        thickness
        color
        roundness
        diameter
        diagonalOrientation
        compression
        byteCount
        fieldCount
        bytesPerRow
        graphicData
    }
  }
}
`;



export default GET_PRINTER_FORMAT;
