/**
 * Derived from the TCVN 5712-1 standard mapping exposed by glibc iconv.
 * Epson reference table: character page 31.
 */
import { singleByte } from '../single-byte.js'

export const page031 = singleByte({
	page: 31,
	name: 'TCVN-3 uppercase',
	high: '                                 ĂÂ    Đ  ÊÔƠƯ       ÀẢÃÁẠ ẰẲẴẮ       ẶẦẨẪẤẬÈ ẺẼÉẸỀỂỄẾỆÌỈ   ĨÍỊÒ ỎÕÓỌỒỔỖỐỘỜỞỠỚỢÙ ỦŨÚỤỪỬỮỨỰỲỶỸÝỴ ',
})
