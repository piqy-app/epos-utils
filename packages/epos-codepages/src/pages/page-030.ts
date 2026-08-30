/**
 * Derived from the TCVN 5712-1 standard mapping exposed by glibc iconv.
 * Epson reference table: character page 30.
 */
import { singleByte } from '../single-byte.js'

export const page030 = singleByte({
	page: 30,
	name: 'TCVN-3 lowercase',
	high: '                                        ăâêôơưđ      àảãáạ ằẳẵắ       ặầẩẫấậè ẻẽéẹềểễếệìỉ   ĩíịò ỏõóọồổỗốộờởỡớợù ủũúụừửữứựỳỷỹýỵ ',
})
